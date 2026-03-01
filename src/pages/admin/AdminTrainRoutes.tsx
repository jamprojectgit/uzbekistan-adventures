import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface RouteForm {
  train_type: string;
  from_city: string;
  to_city: string;
  departure_time: string;
  arrival_time: string;
  operating_days: string;
  price: number;
  currency: string;
  status: string;
}

const emptyForm: RouteForm = {
  train_type: 'Afrosiyob',
  from_city: '',
  to_city: '',
  departure_time: '',
  arrival_time: '',
  operating_days: 'Daily',
  price: 0,
  currency: 'USD',
  status: 'published',
};

const AdminTrainRoutes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<RouteForm>(emptyForm);

  const { data: routes, isLoading } = useQuery({
    queryKey: ['admin-train-routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('train_routes')
        .select('*')
        .order('train_type')
        .order('from_city')
        .order('departure_time');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editId) {
        const { error } = await supabase.from('train_routes').update(form).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('train_routes').insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-train-routes'] });
      toast({ title: editId ? 'Route updated' : 'Route added' });
      setOpen(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: () => toast({ title: 'Error saving route', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('train_routes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-train-routes'] });
      toast({ title: 'Route deleted' });
    },
    onError: () => toast({ title: 'Error deleting route', variant: 'destructive' }),
  });

  const openEdit = (route: any) => {
    setEditId(route.id);
    setForm({
      train_type: route.train_type,
      from_city: route.from_city,
      to_city: route.to_city,
      departure_time: route.departure_time,
      arrival_time: route.arrival_time,
      operating_days: route.operating_days,
      price: route.price,
      currency: route.currency,
      status: route.status,
    });
    setOpen(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Train Routes</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Route</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit Route' : 'Add Route'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label>Train Type *</Label>
                <Select value={form.train_type} onValueChange={(v) => setForm({ ...form, train_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Afrosiyob">Afrosiyob</SelectItem>
                    <SelectItem value="Sharq">Sharq</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>From City *</Label>
                <Input value={form.from_city} onChange={(e) => setForm({ ...form, from_city: e.target.value })} />
              </div>
              <div>
                <Label>To City *</Label>
                <Input value={form.to_city} onChange={(e) => setForm({ ...form, to_city: e.target.value })} />
              </div>
              <div>
                <Label>Departure *</Label>
                <Input value={form.departure_time} onChange={(e) => setForm({ ...form, departure_time: e.target.value })} placeholder="HH:MM" />
              </div>
              <div>
                <Label>Arrival *</Label>
                <Input value={form.arrival_time} onChange={(e) => setForm({ ...form, arrival_time: e.target.value })} placeholder="HH:MM" />
              </div>
              <div>
                <Label>Operating Days</Label>
                <Input value={form.operating_days} onChange={(e) => setForm({ ...form, operating_days: e.target.value })} placeholder="Daily, Fri-Sun" />
              </div>
              <div>
                <Label>Price ($)</Label>
                <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <Button className="w-full" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.from_city || !form.to_city || !form.departure_time || !form.arrival_time}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Train</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead>Arrival</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes && routes.length > 0 ? routes.map((route) => (
              <TableRow key={route.id}>
                <TableCell className="font-medium">{route.train_type}</TableCell>
                <TableCell>{route.from_city}</TableCell>
                <TableCell>{route.to_city}</TableCell>
                <TableCell className="font-mono">{route.departure_time}</TableCell>
                <TableCell className="font-mono">{route.arrival_time}</TableCell>
                <TableCell>
                  <Badge variant={route.operating_days === 'Daily' ? 'outline' : 'secondary'} className="text-xs">
                    {route.operating_days}
                  </Badge>
                </TableCell>
                <TableCell>{route.price > 0 ? `$${route.price}` : '—'}</TableCell>
                <TableCell>
                  <Badge variant={route.status === 'published' ? 'default' : 'secondary'}>{route.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(route)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(route.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No routes found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminTrainRoutes;
