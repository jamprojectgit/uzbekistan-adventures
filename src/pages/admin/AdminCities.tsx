import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';

const AdminCities = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name_en: '', name_ru: '', slug: '', description_en: '', description_ru: '', cover_image: '' });

  const { data: cities, isLoading } = useQuery({
    queryKey: ['admin-cities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cities').select('*');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: { en: form.name_en, ru: form.name_ru },
        slug: form.slug,
        description: { en: form.description_en, ru: form.description_ru },
        cover_image: form.cover_image || null,
      };
      if (editing) {
        const { error } = await supabase.from('cities').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cities').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      setOpen(false);
      resetForm();
      toast.success(t('admin.save'));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-cities'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setForm({ name_en: '', name_ru: '', slug: '', description_en: '', description_ru: '', cover_image: '' });
    setEditing(null);
  };

  const openEdit = (city: any) => {
    const name = city.name as any;
    const desc = city.description as any;
    setForm({
      name_en: name?.en || '', name_ru: name?.ru || '',
      slug: city.slug,
      description_en: desc?.en || '', description_ru: desc?.ru || '',
      cover_image: city.cover_image || '',
    });
    setEditing(city);
    setOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('admin.cities')}</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> {t('admin.add')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? t('admin.edit') : t('admin.add')} City</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name (EN)</Label><Input value={form.name_en} onChange={e => setForm(f => ({...f, name_en: e.target.value}))} required /></div>
                <div><Label>Name (RU)</Label><Input value={form.name_ru} onChange={e => setForm(f => ({...f, name_ru: e.target.value}))} /></div>
              </div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} required /></div>
              <div><Label>Description (EN)</Label><Textarea value={form.description_en} onChange={e => setForm(f => ({...f, description_en: e.target.value}))} /></div>
              <div><Label>Description (RU)</Label><Textarea value={form.description_ru} onChange={e => setForm(f => ({...f, description_ru: e.target.value}))} /></div>
              <div><Label>Cover Image URL</Label><Input value={form.cover_image} onChange={e => setForm(f => ({...f, cover_image: e.target.value}))} /></div>
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
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cities?.map(city => (
              <TableRow key={city.id}>
                <TableCell>{(city.name as any)?.en || ''}</TableCell>
                <TableCell>{city.slug}</TableCell>
                <TableCell className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(city)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm(t('admin.confirmDelete'))) deleteMutation.mutate(city.id); }}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminCities;
