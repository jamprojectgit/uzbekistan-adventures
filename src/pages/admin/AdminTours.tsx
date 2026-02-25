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
import { Pencil, Trash2, Plus, Upload, X, ImageIcon } from 'lucide-react';

const AdminTours = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title_en: '', title_ru: '',
    slug: '',
    description_en: '', description_ru: '',
    price: 0, duration: 1,
    city_id: '',
  });

  const { data: tours, isLoading } = useQuery({
    queryKey: ['admin-tours'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tours').select('*, cities(name)');
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
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from('tour-images').upload(path, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('tour-images').getPublicUrl(path);
        newUrls.push(urlData.publicUrl);
      }
      setImages(prev => [...prev, ...newUrls]);
      toast.success(`${newUrls.length} фото загружено`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
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
        price: form.price,
        duration: form.duration,
        city_id: form.city_id || null,
        images,
      };
      if (editing) {
        const { error } = await supabase.from('tours').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tours').insert(payload);
        if (error) throw error;
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
    setForm({ title_en: '', title_ru: '', slug: '', description_en: '', description_ru: '', price: 0, duration: 1, city_id: '' });
    setImages([]);
    setEditing(null);
  };

  const openEdit = (tour: any) => {
    const title = tour.title as any;
    const desc = tour.description as any;
    setForm({
      title_en: title?.en || '', title_ru: title?.ru || '',
      slug: tour.slug,
      description_en: desc?.en || '', description_ru: desc?.ru || '',
      price: tour.price, duration: tour.duration,
      city_id: tour.city_id || '',
    });
    setImages(tour.images || []);
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
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Price ($)</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: parseInt(e.target.value)||0}))} /></div>
                <div><Label>Duration (days)</Label><Input type="number" value={form.duration} onChange={e => setForm(f => ({...f, duration: parseInt(e.target.value)||1}))} /></div>
              </div>
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
                    {images.map((url, i) => (
                      <div key={i} className="relative group aspect-square rounded-md overflow-hidden border">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
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
                <TableCell>{tour.duration}d</TableCell>
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
