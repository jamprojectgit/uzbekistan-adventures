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
import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';

const VEHICLE_TYPES = ['Sedan', 'Minivan', 'Minibus'];

const AdminTransfers = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [form, setForm] = useState({
    from_city: '',
    to_city: '',
    vehicle_type: 'Sedan',
    max_passengers: 3,
    price: 0,
    currency: 'USD',
    description: '',
    image_url: '',
    status: 'published',
  });

  const { data: transfers, isLoading } = useQuery({
    queryKey: ['admin-transfers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('transfers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        from_city: form.from_city,
        to_city: form.to_city,
        vehicle_type: form.vehicle_type,
        max_passengers: form.max_passengers,
        price: form.price,
        currency: form.currency,
        description: form.description || null,
        image_url: form.image_url || null,
        status: form.status,
      };
      if (editing) {
        const { error } = await supabase.from('transfers').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('transfers').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transfers'] });
      setOpen(false);
      resetForm();
      toast.success('Saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transfers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-transfers'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setForm({ from_city: '', to_city: '', vehicle_type: 'Sedan', max_passengers: 3, price: 0, currency: 'USD', description: '', image_url: '', status: 'published' });
    setEditing(null);
  };

  const openEdit = (transfer: any) => {
    setForm({
      from_city: transfer.from_city,
      to_city: transfer.to_city,
      vehicle_type: transfer.vehicle_type,
      max_passengers: transfer.max_passengers,
      price: Number(transfer.price),
      currency: transfer.currency,
      description: transfer.description || '',
      image_url: transfer.image_url || '',
      status: transfer.status,
    });
    setEditing(transfer);
    setOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Transfers</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Transfer</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>From City</Label><Input value={form.from_city} onChange={e => setForm(f => ({...f, from_city: e.target.value}))} required /></div>
                <div><Label>To City</Label><Input value={form.to_city} onChange={e => setForm(f => ({...f, to_city: e.target.value}))} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Vehicle Type</Label>
                  <Select value={form.vehicle_type} onValueChange={v => setForm(f => ({...f, vehicle_type: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map(vt => <SelectItem key={vt} value={vt}>{vt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Max Passengers</Label><Input type="number" min={1} value={form.max_passengers} onChange={e => setForm(f => ({...f, max_passengers: parseInt(e.target.value)||1}))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Price</Label><Input type="number" min={0} value={form.price} onChange={e => setForm(f => ({...f, price: parseFloat(e.target.value)||0}))} /></div>
                <div><Label>Currency</Label><Input value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))} /></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
              <div><Label>Image URL</Label><Input value={form.image_url} onChange={e => setForm(f => ({...f, image_url: e.target.value}))} /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({...f, status: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saveMutation.isPending}>Save</Button>
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <Skeleton className="h-48" /> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Passengers</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers?.map(tr => (
              <TableRow key={tr.id}>
                <TableCell>{tr.from_city} → {tr.to_city}</TableCell>
                <TableCell>{tr.vehicle_type}</TableCell>
                <TableCell>{tr.max_passengers}</TableCell>
                <TableCell>{tr.price} {tr.currency}</TableCell>
                <TableCell>{tr.status}</TableCell>
                <TableCell className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(tr)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(tr.id); }}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminTransfers;
