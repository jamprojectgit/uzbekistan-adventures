import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Train } from 'lucide-react';

interface DepartureForm {
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

const emptyForm: DepartureForm = {
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

interface RouteGroup {
  key: string;
  train_type: string;
  from_city: string;
  to_city: string;
  departures: any[];
}

const AdminTrainRoutes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<DepartureForm>(emptyForm);

  const { data: routes, isLoading } = useQuery({
    queryKey: ['admin-train-routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('train_routes')
        .select('*')
        .order('departure_time');
      if (error) throw error;
      return data;
    },
  });

  const grouped = useMemo<RouteGroup[]>(() => {
    if (!routes) return [];
    const map = new Map<string, RouteGroup>();
    for (const r of routes) {
      const key = `${r.train_type}||${r.from_city}||${r.to_city}`;
      if (!map.has(key)) {
        map.set(key, { key, train_type: r.train_type, from_city: r.from_city, to_city: r.to_city, departures: [] });
      }
      map.get(key)!.departures.push(r);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.train_type.localeCompare(b.train_type) || a.from_city.localeCompare(b.from_city) || a.to_city.localeCompare(b.to_city)
    );
  }, [routes]);

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
      toast({ title: editId ? 'Departure updated' : 'Departure added' });
      setOpen(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: () => toast({ title: 'Error saving', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('train_routes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-train-routes'] });
      toast({ title: 'Departure deleted' });
    },
    onError: () => toast({ title: 'Error deleting', variant: 'destructive' }),
  });

  const openAddInGroup = (group: RouteGroup) => {
    setEditId(null);
    setForm({ ...emptyForm, train_type: group.train_type, from_city: group.from_city, to_city: group.to_city });
    setOpen(true);
  };

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

  const isGroupPrefilled = form.from_city !== '' && editId === null;

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Train Routes</h2>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />New Route</Button>
      </div>

      {grouped.length === 0 && (
        <p className="text-center py-12 text-muted-foreground">No routes found. Add one to get started.</p>
      )}

      <div className="space-y-6">
        {grouped.map((group) => (
          <div key={group.key} className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <Train className="h-5 w-5 text-primary" />
                <div>
                  <span className="font-semibold">{group.train_type}</span>
                  <span className="mx-2 text-muted-foreground">·</span>
                  <span>{group.from_city} → {group.to_city}</span>
                </div>
                <Badge variant="outline" className="text-xs">{group.departures.length} departures</Badge>
              </div>
              <Button size="sm" variant="outline" onClick={() => openAddInGroup(group)}>
                <Plus className="h-3 w-3 mr-1" />Add departure
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Departure</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.departures.map((dep) => (
                  <TableRow key={dep.id}>
                    <TableCell className="font-mono">{dep.departure_time}</TableCell>
                    <TableCell className="font-mono">{dep.arrival_time}</TableCell>
                    <TableCell>
                      <Badge variant={dep.operating_days === 'Daily' ? 'outline' : 'secondary'} className="text-xs">{dep.operating_days}</Badge>
                    </TableCell>
                    <TableCell>{dep.price > 0 ? `$${dep.price}` : '—'}</TableCell>
                    <TableCell>
                      <Badge variant={dep.status === 'published' ? 'default' : 'secondary'}>{dep.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(dep)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(dep.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Departure' : 'Add Departure'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label>Train Type *</Label>
              <Select value={form.train_type} onValueChange={(v) => setForm({ ...form, train_type: v })} disabled={isGroupPrefilled}>
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
              <Input value={form.from_city} onChange={(e) => setForm({ ...form, from_city: e.target.value })} disabled={isGroupPrefilled} />
            </div>
            <div>
              <Label>To City *</Label>
              <Input value={form.to_city} onChange={(e) => setForm({ ...form, to_city: e.target.value })} disabled={isGroupPrefilled} />
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
  );
};

export default AdminTrainRoutes;
