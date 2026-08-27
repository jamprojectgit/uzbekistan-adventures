import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { Pencil, Trash2, Plus, Upload, X, ImageIcon, Zap, Check, Loader2 } from 'lucide-react';
import { formatBytes, compressImage, getRemoteSize, MAX_IMAGE_BYTES } from '@/lib/image-utils';
import { sortTiers, validateTiers, getPricingType, type PriceTier } from '@/lib/price-utils';

type ImageMeta = { size: number; originalSize?: number; optimized?: boolean };

const AdminTours = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [imageMeta, setImageMeta] = useState<Record<string, ImageMeta>>({});
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pricingType, setPricingType] = useState<'per_person' | 'per_group'>('per_person');
  const [tiers, setTiers] = useState<PriceTier[]>([]);

  const [form, setForm] = useState({
    title_en: '', title_ru: '',
    slug: '',
    description_en: '', description_ru: '',
    itinerary_en: '', itinerary_ru: '',
    included_en: '', included_ru: '',
    excluded_en: '', excluded_ru: '',
    price: 0, duration: 1,
    duration_value: 1, duration_unit: 'days',
    city_id: '',
    order_number: '' as string | number,
    price_group_size: 1,
  });

  const { data: tours, isLoading } = useQuery({
    queryKey: ['admin-tours'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tours').select('*, cities(name), tour_price_tiers(*)').order('order_number', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: cities } = useQuery({
    queryKey: ['all-cities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cities').select('*');
      if (error) throw error;
      return data;
    },
  });

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    const newUrls: string[] = [];
    const newMeta: Record<string, ImageMeta> = {};
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from('tour-images').upload(path, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('tour-images').getPublicUrl(path);
        newUrls.push(urlData.publicUrl);
        newMeta[urlData.publicUrl] = { size: file.size };
      }
      setImages(prev => [...prev, ...newUrls]);
      setImageMeta(prev => ({ ...prev, ...newMeta }));
      toast.success(`${newUrls.length} фото загружено`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const loadSizes = async (urls: string[]) => {
    const entries = await Promise.all(
      urls.map(async (url) => [url, { size: await getRemoteSize(url) }] as const),
    );
    setImageMeta(prev => {
      const next = { ...prev };
      entries.forEach(([url, meta]) => { if (!next[url]) next[url] = meta; });
      return next;
    });
  };

  const optimizeImage = async (url: string) => {
    setOptimizing(url);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Не удалось загрузить изображение');
      const original = await res.blob();
      const originalSize = imageMeta[url]?.originalSize ?? imageMeta[url]?.size ?? original.size;
      const { blob, type, ext } = await compressImage(original, MAX_IMAGE_BYTES);

      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('tour-images').upload(path, blob, { contentType: type });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('tour-images').getPublicUrl(path);
      const newUrl = urlData.publicUrl;

      setImages(prev => prev.map(u => (u === url ? newUrl : u)));
      setImageMeta(prev => ({
        ...prev,
        [newUrl]: { size: blob.size, originalSize, optimized: true },
      }));
      toast.success(`Изображение успешно оптимизировано: ${formatBytes(originalSize)} → ${formatBytes(blob.size)}`);
    } catch (e: any) {
      toast.error(e.message || 'Ошибка оптимизации');
    } finally {
      setOptimizing(null);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: { en: form.title_en, ru: form.title_ru },
        slug: form.slug,
        description: { en: form.description_en, ru: form.description_ru },
        itinerary: { en: form.itinerary_en, ru: form.itinerary_ru },
        included: { en: form.included_en.split('\n').filter(Boolean), ru: form.included_ru.split('\n').filter(Boolean) },
        excluded: { en: form.excluded_en.split('\n').filter(Boolean), ru: form.excluded_ru.split('\n').filter(Boolean) },
        price: form.price,
        duration: form.duration_value,
        duration_value: form.duration_value,
        duration_unit: form.duration_unit,
        city_id: form.city_id || null,
        order_number: form.order_number === '' ? null : Number(form.order_number),
        price_group_size: Math.max(1, Number(form.price_group_size) || 1),
        pricing_type: pricingType,
        images,
      };

      const normalized = tiers.map(tr => ({
        min_people: Number(tr.min_people) || 0,
        max_people: Number(tr.max_people) || 0,
        price: Number(tr.price) || 0,
      }));
      if (pricingType === 'per_group') {
        const err = validateTiers(normalized);
        if (err) throw new Error(err);
      }

      let tourId = editing?.id as string | undefined;
      if (editing) {
        const { error } = await supabase.from('tours').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('tours').insert(payload).select('id').single();
        if (error) throw error;
        tourId = data.id;
      }

      if (tourId) {
        const { error: delError } = await supabase.from('tour_price_tiers').delete().eq('tour_id', tourId);
        if (delError) throw delError;
        if (pricingType === 'per_group' && normalized.length) {
          const { error: insError } = await supabase
            .from('tour_price_tiers')
            .insert(normalized.map(tr => ({ ...tr, tour_id: tourId! })));
          if (insError) throw insError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      setOpen(false);
      resetForm();
      toast.success(t('admin.save'));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tours').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tours'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setForm({ title_en: '', title_ru: '', slug: '', description_en: '', description_ru: '', itinerary_en: '', itinerary_ru: '', included_en: '', included_ru: '', excluded_en: '', excluded_ru: '', price: 0, duration: 1, duration_value: 1, duration_unit: 'days', city_id: '', order_number: '', price_group_size: 1 });
    setImages([]);
    setImageMeta({});
    setPricingType('per_person');
    setTiers([]);
    setEditing(null);
  };

  const openEdit = (tour: any) => {
    const title = tour.title as any;
    const desc = tour.description as any;
    const itin = tour.itinerary as any;
    const incl = tour.included as any;
    const excl = tour.excluded as any;
    setForm({
      title_en: title?.en || '', title_ru: title?.ru || '',
      slug: tour.slug,
      description_en: desc?.en || '', description_ru: desc?.ru || '',
      itinerary_en: itin?.en || '', itinerary_ru: itin?.ru || '',
      included_en: Array.isArray(incl?.en) ? incl.en.join('\n') : (incl?.en || ''),
      included_ru: Array.isArray(incl?.ru) ? incl.ru.join('\n') : (incl?.ru || ''),
      excluded_en: Array.isArray(excl?.en) ? excl.en.join('\n') : (excl?.en || ''),
      excluded_ru: Array.isArray(excl?.ru) ? excl.ru.join('\n') : (excl?.ru || ''),
      price: tour.price, duration: tour.duration,
      duration_value: tour.duration_value ?? tour.duration,
      duration_unit: tour.duration_unit ?? 'days',
      city_id: tour.city_id || '',
      order_number: tour.order_number ?? '',
      price_group_size: (tour as any).price_group_size ?? 1,
    });
    setPricingType(getPricingType(tour.pricing_type));
    setTiers(sortTiers((tour.tour_price_tiers || []) as PriceTier[]).map((tr: PriceTier) => ({
      min_people: tr.min_people, max_people: tr.max_people, price: tr.price,
    })));
    setImages(tour.images || []);
    setImageMeta({});
    if (tour.images?.length) loadSizes(tour.images);
    setEditing(tour);
    setOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('admin.tours')}</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> {t('admin.add')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? t('admin.edit') : t('admin.add')} Tour</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Title (EN)</Label><Input value={form.title_en} onChange={e => setForm(f => ({...f, title_en: e.target.value}))} required /></div>
                <div><Label>Title (RU)</Label><Input value={form.title_ru} onChange={e => setForm(f => ({...f, title_ru: e.target.value}))} /></div>
              </div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} required /></div>
              <div><Label>Description (EN)</Label><Textarea value={form.description_en} onChange={e => setForm(f => ({...f, description_en: e.target.value}))} /></div>
              <div><Label>Description (RU)</Label><Textarea value={form.description_ru} onChange={e => setForm(f => ({...f, description_ru: e.target.value}))} /></div>
              <div><Label>Itinerary (EN)</Label><Textarea value={form.itinerary_en} onChange={e => setForm(f => ({...f, itinerary_en: e.target.value}))} rows={4} /></div>
              <div><Label>Itinerary (RU)</Label><Textarea value={form.itinerary_ru} onChange={e => setForm(f => ({...f, itinerary_ru: e.target.value}))} rows={4} /></div>
              <div><Label>Included (EN) — одна строка = один пункт</Label><Textarea value={form.included_en} onChange={e => setForm(f => ({...f, included_en: e.target.value}))} rows={3} placeholder="Transport&#10;Guide&#10;Lunch" /></div>
              <div><Label>Included (RU)</Label><Textarea value={form.included_ru} onChange={e => setForm(f => ({...f, included_ru: e.target.value}))} rows={3} placeholder="Транспорт&#10;Гид&#10;Обед" /></div>
              <div><Label>Not Included (EN)</Label><Textarea value={form.excluded_en} onChange={e => setForm(f => ({...f, excluded_en: e.target.value}))} rows={3} placeholder="Flights&#10;Insurance" /></div>
              <div><Label>Not Included (RU)</Label><Textarea value={form.excluded_ru} onChange={e => setForm(f => ({...f, excluded_ru: e.target.value}))} rows={3} placeholder="Перелёт&#10;Страховка" /></div>
              <div className="grid grid-cols-4 gap-3">
                <div><Label>Price ($)</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: parseInt(e.target.value)||0}))} /></div>
                <div><Label>Duration</Label><Input type="number" value={form.duration_value} onChange={e => setForm(f => ({...f, duration_value: parseInt(e.target.value)||1}))} /></div>
                <div>
                  <Label>Unit</Label>
                  <Select value={form.duration_unit} onValueChange={v => setForm(f => ({...f, duration_unit: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Order №</Label><Input type="number" value={form.order_number} onChange={e => setForm(f => ({...f, order_number: e.target.value === '' ? '' : parseInt(e.target.value)}))} placeholder="—" /></div>
              </div>
              <div>
                <Label>Pricing type</Label>
                <Select value={pricingType} onValueChange={v => setPricingType(v as 'per_person' | 'per_group')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_person">Per Person</SelectItem>
                    <SelectItem value="per_group">Per Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {pricingType === 'per_person' ? (
                <div><Label>Price applies to (travelers)</Label><Input type="number" min={1} value={form.price_group_size} onChange={e => setForm(f => ({...f, price_group_size: Math.max(1, parseInt(e.target.value) || 1)}))} /></div>
              ) : (
                <div className="space-y-2 rounded-lg border border-border p-3">
                  <Label>Group pricing ranges</Label>
                  {tiers.length === 0 && <p className="text-xs text-muted-foreground">Диапазоны не заданы</p>}
                  {tiers.map((tier, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                      <div>
                        <Label className="text-xs">From</Label>
                        <Input type="number" min={1} value={tier.min_people}
                          onChange={e => setTiers(prev => prev.map((tr, idx) => idx === i ? { ...tr, min_people: parseInt(e.target.value) || 0 } : tr))} />
                      </div>
                      <div>
                        <Label className="text-xs">To</Label>
                        <Input type="number" min={1} value={tier.max_people}
                          onChange={e => setTiers(prev => prev.map((tr, idx) => idx === i ? { ...tr, max_people: parseInt(e.target.value) || 0 } : tr))} />
                      </div>
                      <div>
                        <Label className="text-xs">Price ($)</Label>
                        <Input type="number" min={0} value={tier.price}
                          onChange={e => setTiers(prev => prev.map((tr, idx) => idx === i ? { ...tr, price: parseInt(e.target.value) || 0 } : tr))} />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setTiers(prev => prev.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setTiers(prev => {
                    const last = prev[prev.length - 1];
                    const start = last ? last.max_people + 1 : 1;
                    return [...prev, { min_people: start, max_people: start, price: 0 }];
                  })}>
                    <Plus className="h-4 w-4 mr-1" /> Add pricing rule
                  </Button>
                </div>
              )}
              <div>
                <Label>City</Label>
                <Select value={form.city_id} onValueChange={v => setForm(f => ({...f, city_id: v}))}>
                  <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                  <SelectContent>
                    {cities?.map(c => <SelectItem key={c.id} value={c.id}>{(c.name as any)?.en || c.slug}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Images upload */}
              <div>
                <Label>Фото</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && uploadImages(e.target.files)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-1"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Загрузка...' : 'Загрузить фото'}
                </Button>
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {images.map((url, i) => {
                      const meta = imageMeta[url];
                      const size = meta?.size ?? 0;
                      const tooBig = size > MAX_IMAGE_BYTES;
                      const busy = optimizing === url;
                      return (
                        <div key={url + i} className="space-y-1">
                          <div className="relative group aspect-square rounded-md overflow-hidden border">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="text-[11px] leading-tight text-muted-foreground">
                            {meta?.optimized && meta.originalSize ? (
                              <span>
                                <span className="line-through">{formatBytes(meta.originalSize)}</span>{' '}
                                <span className="text-primary font-medium">{formatBytes(size)}</span>
                              </span>
                            ) : (
                              <span className={tooBig ? 'text-destructive font-medium' : ''}>
                                {size ? formatBytes(size) : '…'}
                              </span>
                            )}
                          </div>
                          {meta?.optimized && (
                            <div className="flex items-center gap-1 text-[11px] text-primary">
                              <Check className="h-3 w-3" /> Оптимизировано
                            </div>
                          )}
                          {tooBig && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="w-full h-7 text-[11px]"
                              disabled={busy}
                              onClick={() => optimizeImage(url)}
                            >
                              {busy ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Zap className="h-3 w-3 mr-1" />}
                              {busy ? 'Сжатие...' : 'Оптимизировать'}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saveMutation.isPending}>{t('admin.save')}</Button>
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>{t('admin.cancel')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <Skeleton className="h-48" /> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Фото</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tours?.map(tour => (
              <TableRow key={tour.id}>
                <TableCell>
                  {tour.images && tour.images.length > 0 ? (
                    <img src={tour.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell>{(tour.title as any)?.en || ''}</TableCell>
                <TableCell>{tour.slug}</TableCell>
                <TableCell>${tour.price}</TableCell>
                <TableCell>{tour.duration_value ?? tour.duration}{tour.duration_unit === 'hours' ? 'h' : 'd'}</TableCell>
                <TableCell>{(tour as any).order_number ?? '—'}</TableCell>
                <TableCell className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(tour)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm(t('admin.confirmDelete'))) deleteMutation.mutate(tour.id); }}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminTours;
