'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, AlertCircle, Loader2 } from 'lucide-react';

interface Mashina {
    id: number;
    moshina_nomeri: string;
    createdAt: string;
}

interface FormattedMashina extends Mashina {
    formattedDate: string;
}

export default function MashinalarPage() {
    const [mashinalar, setMashinalar] = useState<FormattedMashina[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [newCarNumber, setNewCarNumber] = useState('');
    const [editMashina, setEditMashina] = useState<FormattedMashina | null>(null);
    const [deleteMashina, setDeleteMashina] = useState<FormattedMashina | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // GET - Mashinalarni serverdan olish
    useEffect(() => {
        fetchMashinalar();
    }, []);

    const fetchMashinalar = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/mashinalar');
            if (!response.ok) throw new Error('Ma\'lumotlarni olishda xatolik');

            const data: Mashina[] = await response.json();
            const formattedMashinalar = data.map(mashina => ({
                ...mashina,
                formattedDate: new Date(mashina.createdAt).toLocaleDateString('uz-UZ')
            }));
            setMashinalar(formattedMashinalar);
        } catch (error) {
            console.error('Xatolik:', error);
            setError('Ma\'lumotlarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const filteredMashinalar = mashinalar.filter(mashina =>
        mashina.moshina_nomeri.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Mashina raqami mavjudligini tekshirish
    const isCarNumberExists = (carNumber: string, excludeId?: number) => {
        return mashinalar.some(mashina =>
            mashina.moshina_nomeri === carNumber && mashina.id !== excludeId
        );
    };

    // POST - Yangi mashina qo'shish
    const handleAddCar = async () => {
        if (!newCarNumber.trim()) {
            setError('Mashina raqamini kiriting');
            return;
        }

        if (isCarNumberExists(newCarNumber)) {
            setError('Bu mashina raqami allaqachon mavjud');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch('/api/mashinalar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    moshina_nomeri: newCarNumber
                }),
            });

            if (!response.ok) throw new Error('Mashina qo\'shishda xatolik');

            const newMashina: Mashina = await response.json();
            const formattedMashina: FormattedMashina = {
                ...newMashina,
                formattedDate: new Date(newMashina.createdAt).toLocaleDateString('uz-UZ')
            };

            setMashinalar(prev => [...prev, formattedMashina]);
            setNewCarNumber('');
            setError('');
            setIsAddDialogOpen(false);
        } catch (error) {
            console.error('Xatolik:', error);
            setError('Mashina qo\'shishda xatolik');
        } finally {
            setActionLoading(false);
        }
    };

    // PUT - Mashinani tahrirlash
    const handleEditCar = async () => {
        if (!editMashina || !editMashina.moshina_nomeri.trim()) {
            setError('Mashina raqamini kiriting');
            return;
        }

        if (isCarNumberExists(editMashina.moshina_nomeri, editMashina.id)) {
            setError('Bu mashina raqami allaqachon mavjud');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch('/api/mashinalar', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editMashina.id,
                    moshina_nomeri: editMashina.moshina_nomeri
                }),
            });

            if (!response.ok) throw new Error('Mashinani yangilashda xatolik');

            const updatedMashina: Mashina = await response.json();
            const formattedMashina: FormattedMashina = {
                ...updatedMashina,
                formattedDate: new Date(updatedMashina.createdAt).toLocaleDateString('uz-UZ')
            };

            setMashinalar(prev =>
                prev.map(m => m.id === formattedMashina.id ? formattedMashina : m)
            );

            setEditMashina(null);
            setError('');
            setIsEditDialogOpen(false);
        } catch (error) {
            console.error('Xatolik:', error);
            setError('Mashinani yangilashda xatolik');
        } finally {
            setActionLoading(false);
        }
    };

    // DELETE - Mashinani o'chirish
    const handleDeleteCar = async () => {
        if (!deleteMashina) return;

        setActionLoading(true);
        try {
            const response = await fetch('/api/mashinalar', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: deleteMashina.id }),
            });

            if (!response.ok) throw new Error('Mashinani o\'chirishda xatolik');

            setMashinalar(prev => prev.filter(m => m.id !== deleteMashina.id));
            setDeleteMashina(null);
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error('Xatolik:', error);
            setError('Mashinani o\'chirishda xatolik');
        } finally {
            setActionLoading(false);
        }
    };

    // Tahrirlashni boshlash
    const handleEditClick = (mashina: FormattedMashina) => {
        setEditMashina({ ...mashina });
        setError('');
        setIsEditDialogOpen(true);
    };

    // O'chirishni boshlash
    const handleDeleteClick = (mashina: FormattedMashina) => {
        setDeleteMashina(mashina);
        setIsDeleteDialogOpen(true);
    };

    const handleAddDialogOpen = () => {
        setNewCarNumber('');
        setError('');
        setIsAddDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Mashinalar</h1>
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
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Mashinalar</h1>

                {/* Yangi mashina qo'shish dialogi */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap text-base py-2 px-4 h-auto"
                            onClick={handleAddDialogOpen}
                        >
                            <Plus className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                            Yangi Mashina
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Yangi Mashina Qo'shish</DialogTitle>
                            <DialogDescription>
                                Mashina raqamini kiriting. Mashina raqami takrorlanmas bo'lishi kerak.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="carNumber">Mashina Raqami</Label>
                                <Input
                                    id="carNumber"
                                    placeholder="Masalan: 123"
                                    value={newCarNumber}
                                    onChange={(e) => {
                                        setNewCarNumber(e.target.value);
                                        setError('');
                                    }}
                                    className={error ? 'border-red-500' : ''}
                                />
                                {error && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}
                            </div>
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
                                type="button"
                                onClick={handleAddCar}
                                disabled={!newCarNumber.trim() || actionLoading}
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
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tahrirlash dialogi */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mashinani Tahrirlash</DialogTitle>
                        <DialogDescription>
                            Mashina raqamini o'zgartiring.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="editCarNumber">Mashina Raqami</Label>
                            <Input
                                id="editCarNumber"
                                placeholder="Masalan: 123"
                                value={editMashina?.moshina_nomeri || ''}
                                onChange={(e) => {
                                    if (editMashina) {
                                        setEditMashina({ ...editMashina, moshina_nomeri: e.target.value });
                                        setError('');
                                    }
                                }}
                                className={error ? 'border-red-500' : ''}
                            />
                            {error && (
                                <div className="flex items-center gap-2 text-red-600 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                        </div>
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
                            type="button"
                            onClick={handleEditCar}
                            disabled={!editMashina?.moshina_nomeri.trim() || actionLoading}
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
                </DialogContent>
            </Dialog>

            {/* O'chirish dialogi */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mashinani O'chirish</DialogTitle>
                        <DialogDescription>
                            Rostan ham <strong>{deleteMashina?.moshina_nomeri}</strong> raqamli mashinani o'chirmoqchimisiz?
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
                            onClick={handleDeleteCar}
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

            <Card className="shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <CardTitle className="text-lg lg:text-xl">Mashinalar Ro'yxati</CardTitle>
                        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-4 md:space-y-0">
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Mashina raqimi bo'yicha qidirish..."
                                    className="pl-9 h-10 lg:h-11 text-base w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="text-base text-muted-foreground font-medium whitespace-nowrap">
                                Jami: {filteredMashinalar.length} ta
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20 font-semibold text-base">T/R</TableHead>
                                <TableHead className="font-semibold text-base">Mashina Raqami</TableHead>
                                <TableHead className="w-36 font-semibold text-base">Qo'shilgan Sana</TableHead>
                                <TableHead className="w-28 font-semibold text-base">Amallar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMashinalar.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-base">
                                        {searchTerm ? 'Hech narsa topilmadi' : 'Hozircha mashinalar mavjud emas'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMashinalar.map((mashina, i) => (
                                    <TableRow key={mashina.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium py-3 text-base">{i + 1}</TableCell>
                                        <TableCell className="font-semibold py-3 text-base">{mashina.moshina_nomeri}</TableCell>
                                        <TableCell className="py-3 text-base">{mashina.formattedDate}</TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 w-9 p-0"
                                                    onClick={() => handleEditClick(mashina)}
                                                    disabled={actionLoading}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteClick(mashina)}
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
