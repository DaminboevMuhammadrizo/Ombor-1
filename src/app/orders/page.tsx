'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { readJsonFile, writeJsonFile, deleteFromFile, updateInFile } from '@/lib/json-utils';

interface Order {
    id: number;
    moshina_nomeri: string;
    description: string;
    usta_haqi?: number;
    sanasi: string;
    zapchast_soni: number;
    zapchast_kod: string;
    created_at: string;
}

interface Mashina {
    id: number;
    moshina_nomeri: string;
}

interface Zapchast {
    id: number;
    nomi: string;
    kod: string;
    soni: number;
    narxi: number;
}

export default function TamirlashPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [mashinalar, setMashinalar] = useState<Mashina[]>([]);
    const [zapchastlar, setZapchastlar] = useState<Zapchast[]>([]);
    const [formData, setFormData] = useState({
        moshina_nomeri: '',
        description: '',
        usta_haqi: '',
        sanasi: '',
        zapchast_soni: '',
        zapchast_kod: ''
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [zapchastSearchTerm, setZapchastSearchTerm] = useState('');

    const filteredOrders = orders.filter(order =>
        order.moshina_nomeri.toLowerCase().includes(searchTerm.toLowerCase()) &&
        order.zapchast_kod.toLowerCase().includes(zapchastSearchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchOrders();
        fetchMashinalar();
        fetchZapchastlar();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await readJsonFile('servislar.json');
            setOrders(data);
        } catch (error) {
            console.error('Xatolik:', error);
            setError('Buyurtmalarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const fetchMashinalar = async () => {
        try {
            const data = await readJsonFile('moshinalar.json');
            setMashinalar(data);
        } catch (error) {
            console.error('Xatolik:', error);
        }
    };

    const fetchZapchastlar = async () => {
        try {
            const data = await readJsonFile('zapchastlar.json');
            setZapchastlar(data);
        } catch (error) {
            console.error('Xatolik:', error);
        }
    };

    // POST - Yangi buyurtma qo'shish
    const createOrder = async () => {
        if (!formData.moshina_nomeri || !formData.description) {
            setError('Mashina raqami va tavsifni kiriting');
            return;
        }

        setActionLoading(true);
        try {
            const newOrder = await writeJsonFile('servislar.json', {
                moshina_nomeri: formData.moshina_nomeri,
                description: formData.description,
                usta_haqi: formData.usta_haqi ? parseFloat(formData.usta_haqi) : 0,
                sanasi: formData.sanasi || new Date().toISOString().split('T')[0],
                zapchast_soni: parseInt(formData.zapchast_soni) || 0,
                zapchast_kod: formData.zapchast_kod
            });

            setOrders(prev => [...prev, newOrder]);
            resetForm();
            setIsAddDialogOpen(false);
        } catch (error: any) {
            console.error('Xatolik:', error);
            setError(error.message || 'Buyurtma qo\'shishda xatolik');
        } finally {
            setActionLoading(false);
        }
    };

    // PUT - Buyurtmani tahrirlash
    const updateOrder = async (id: number) => {
        if (!formData.moshina_nomeri || !formData.description) {
            setError('Mashina raqami va tavsifni kiriting');
            return;
        }

        setActionLoading(true);
        try {
            const updatedOrder = await updateInFile('servislar.json', id, {
                moshina_nomeri: formData.moshina_nomeri,
                description: formData.description,
                usta_haqi: formData.usta_haqi ? parseFloat(formData.usta_haqi) : 0,
                sanasi: formData.sanasi,
                zapchast_soni: parseInt(formData.zapchast_soni) || 0,
                zapchast_kod: formData.zapchast_kod
            });

            setOrders(prev => prev.map(order => order.id === id ? updatedOrder : order));
            resetForm();
            setIsEditDialogOpen(false);
        } catch (error: any) {
            console.error('Xatolik:', error);
            setError(error.message || 'Buyurtmani yangilashda xatolik');
        } finally {
            setActionLoading(false);
        }
    };

    // DELETE - Buyurtmani o'chirish
    const deleteOrderHandler = async () => {
        if (!deleteOrder) return;

        setActionLoading(true);
        try {
            await deleteFromFile('servislar.json', deleteOrder.id);

            setOrders(prev => prev.filter(order => order.id !== deleteOrder.id));
            setDeleteOrder(null);
            setIsDeleteDialogOpen(false);
        } catch (error: any) {
            console.error('Xatolik:', error);
            setError(error.message || 'Buyurtmani o\'chirishda xatolik');
        } finally {
            setActionLoading(false);
        }
    };

    const startEdit = (order: Order) => {
        setFormData({
            moshina_nomeri: order.moshina_nomeri,
            description: order.description,
            usta_haqi: order.usta_haqi?.toString() || '',
            sanasi: order.sanasi.split('T')[0],
            zapchast_soni: order.zapchast_soni.toString(),
            zapchast_kod: order.zapchast_kod
        });
        setEditingId(order.id);
        setError('');
        setIsEditDialogOpen(true);
    };

    const startDelete = (order: Order) => {
        setDeleteOrder(order);
        setIsDeleteDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            moshina_nomeri: '',
            description: '',
            usta_haqi: '',
            sanasi: '',
            zapchast_soni: '',
            zapchast_kod: ''
        });
        setEditingId(null);
        setError('');
    };

    const handleAddDialogOpen = () => {
        resetForm();
        setIsAddDialogOpen(true);
    };

    const getZapchastNomi = (kod: string) => {
        const zapchast = zapchastlar.find(z => z.kod === kod);
        return zapchast ? zapchast.nomi : 'Noma\'lum';
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tamirlash Buyurtmalari</h1>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Yuklanmoqda...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tamirlash Buyurtmalari</h1>

                {/* Yangi buyurtma qo'shish dialogi */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap text-base py-2 px-4 h-auto"
                            onClick={handleAddDialogOpen}
                        >
                            <Plus className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                            Yangi Buyurtma
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Yangi Buyurtma Qo'shish</DialogTitle>
                            <DialogDescription>
                                Buyurtma ma'lumotlarini to'ldiring.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            createOrder();
                        }}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Mashina raqami */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="moshina_nomeri">Mashina raqami *</Label>
                                        <select
                                            id="moshina_nomeri"
                                            value={formData.moshina_nomeri}
                                            onChange={(e) => setFormData({ ...formData, moshina_nomeri: e.target.value })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Mashina tanlang</option>
                                            {mashinalar.map((mashina) => (
                                                <option key={mashina.id} value={mashina.moshina_nomeri}>
                                                    {mashina.moshina_nomeri}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Zapchast kodi */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="zapchast_kod">Zapchast kodi</Label>
                                        <select
                                            id="zapchast_kod"
                                            value={formData.zapchast_kod}
                                            onChange={(e) => setFormData({ ...formData, zapchast_kod: e.target.value })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Zapchast tanlang</option>
                                            {zapchastlar.map((zapchast) => (
                                                <option key={zapchast.id} value={zapchast.kod}>
                                                    {zapchast.kod} - {zapchast.nomi}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Usta haqi */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="usta_haqi">Usta haqi ($)</Label>
                                        <Input
                                            id="usta_haqi"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.usta_haqi}
                                            onChange={(e) => setFormData({ ...formData, usta_haqi: e.target.value })}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Zapchast soni */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="zapchast_soni">Zapchast soni</Label>
                                        <Input
                                            id="zapchast_soni"
                                            type="number"
                                            placeholder="0"
                                            value={formData.zapchast_soni}
                                            onChange={(e) => setFormData({ ...formData, zapchast_soni: e.target.value })}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Sana */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="sanasi">Sana</Label>
                                        <Input
                                            id="sanasi"
                                            type="date"
                                            value={formData.sanasi}
                                            onChange={(e) => setFormData({ ...formData, sanasi: e.target.value })}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                {/* Tavsif */}
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Tavsif *</Label>
                                    <textarea
                                        id="description"
                                        placeholder="Ish tavsifini yozing..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddDialogOpen(false)}
                                    disabled={actionLoading}
                                >
                                    Bekor qilish
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!formData.moshina_nomeri || !formData.description || actionLoading}
                                >
                                    {actionLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Qo'shilmoqda...
                                        </>
                                    ) : (
                                        'Qo\'shish'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tahrirlash dialogi */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Buyurtmani Tahrirlash</DialogTitle>
                        <DialogDescription>
                            Buyurtma ma'lumotlarini o'zgartiring.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        updateOrder(editingId!);
                    }}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Mashina raqami */}
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_moshina_nomeri">Mashina raqami *</Label>
                                    <select
                                        id="edit_moshina_nomeri"
                                        value={formData.moshina_nomeri}
                                        onChange={(e) => setFormData({ ...formData, moshina_nomeri: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Mashina tanlang</option>
                                        {mashinalar.map((mashina) => (
                                            <option key={mashina.id} value={mashina.moshina_nomeri}>
                                                {mashina.moshina_nomeri}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Zapchast kodi */}
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_zapchast_kod">Zapchast kodi</Label>
                                    <select
                                        id="edit_zapchast_kod"
                                        value={formData.zapchast_kod}
                                        onChange={(e) => setFormData({ ...formData, zapchast_kod: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Zapchast tanlang</option>
                                        {zapchastlar.map((zapchast) => (
                                            <option key={zapchast.id} value={zapchast.kod}>
                                                {zapchast.kod} - {zapchast.nomi}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Usta haqi */}
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_usta_haqi">Usta haqi ($)</Label>
                                    <Input
                                        id="edit_usta_haqi"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.usta_haqi}
                                        onChange={(e) => setFormData({ ...formData, usta_haqi: e.target.value })}
                                        className="w-full"
                                    />
                                </div>

                                {/* Zapchast soni */}
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_zapchast_soni">Zapchast soni</Label>
                                    <Input
                                        id="edit_zapchast_soni"
                                        type="number"
                                        placeholder="0"
                                        value={formData.zapchast_soni}
                                        onChange={(e) => setFormData({ ...formData, zapchast_soni: e.target.value })}
                                        className="w-full"
                                    />
                                </div>

                                {/* Sana */}
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_sanasi">Sana</Label>
                                    <Input
                                        id="edit_sanasi"
                                        type="date"
                                        value={formData.sanasi}
                                        onChange={(e) => setFormData({ ...formData, sanasi: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Tavsif */}
                            <div className="grid gap-2">
                                <Label htmlFor="edit_description">Tavsif *</Label>
                                <textarea
                                    id="edit_description"
                                    placeholder="Ish tavsifini yozing..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                                disabled={actionLoading}
                            >
                                Bekor qilish
                            </Button>
                            <Button
                                type="submit"
                                disabled={!formData.moshina_nomeri || !formData.description || actionLoading}
                            >
                                {actionLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Yangilanmoqda...
                                    </>
                                ) : (
                                    'Saqlash'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* O'chirish dialogi */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Buyurtmani O'chirish</DialogTitle>
                        <DialogDescription>
                            Rostan ham <strong>{deleteOrder?.moshina_nomeri}</strong> raqamli mashina uchun buyurtmani o'chirmoqchimisiz?
                            <br />
                            Bu amalni ortga qaytarib bo'lmaydi.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={actionLoading}
                        >
                            Bekor qilish
                        </Button>
                        <Button
                            type="button"
                            onClick={deleteOrderHandler}
                            variant="destructive"
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    O'chirilmoqda...
                                </>
                            ) : (
                                'Ochirish'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Buyurtmalar ro'yxati */}
            <Card className="shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <CardTitle className="text-lg lg:text-xl">Buyurtmalar Ro'yxati</CardTitle>
                        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-4 md:space-y-0">
                            {/* Mashina raqami bo'yicha qidiruv */}
                            <div className="relative w-full md:w-60">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Mashina raqami bo'yicha..."
                                    className="pl-9 h-10 lg:h-11 text-base w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Zapchast kodi bo'yicha qidiruv */}
                            <div className="relative w-full md:w-60">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Zapchast kodi bo'yicha..."
                                    className="pl-9 h-10 lg:h-11 text-base w-full"
                                    value={zapchastSearchTerm}
                                    onChange={(e) => setZapchastSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="text-base text-muted-foreground font-medium whitespace-nowrap">
                                Jami: {filteredOrders.length} ta
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20 font-semibold text-base">T/R</TableHead>
                                <TableHead className="font-semibold text-base">Mashina</TableHead>
                                <TableHead className="font-semibold text-base">Tavsif</TableHead>
                                <TableHead className="w-28 font-semibold text-base">Usta haqi</TableHead>
                                <TableHead className="w-36 font-semibold text-base">Zapchast</TableHead>
                                <TableHead className="w-28 font-semibold text-base">Sana</TableHead>
                                <TableHead className="w-28 font-semibold text-base">Amallar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-base">
                                        {searchTerm || zapchastSearchTerm ? 'Hech narsa topilmadi' : 'Hozircha buyurtmalar mavjud emas'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order, index) => (
                                    <TableRow key={order.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium py-3 text-base">{index + 1}</TableCell>
                                        <TableCell className="font-semibold py-3 text-base">{order.moshina_nomeri}</TableCell>
                                        <TableCell className="py-3 text-base">
                                            <div className="max-w-xs" title={order.description}>
                                                {order.description}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 text-base">
                                            {order.usta_haqi ? `$${order.usta_haqi}` : '-'}
                                        </TableCell>
                                        <TableCell className="py-3 text-base">
                                            <div>
                                                <div className="font-medium">{order.zapchast_kod}</div>
                                                <div className="text-sm text-gray-500">
                                                    {getZapchastNomi(order.zapchast_kod)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {order.zapchast_soni} ta
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 text-base">
                                            {new Date(order.sanasi).toLocaleDateString('uz-UZ')}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 w-9 p-0"
                                                    onClick={() => startEdit(order)}
                                                    disabled={actionLoading}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => startDelete(order)}
                                                    disabled={actionLoading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
