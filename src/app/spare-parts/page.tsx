'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { readJsonFile, writeJsonFile, deleteFromFile, updateInFile } from '@/lib/json-utils';

interface Zapchast {
    id: number;
    nomi: string;
    kod: string;
    soni: number;
    narxi: number;
    kelgan_sanasi: string;
    created_at: string;
}

interface FormattedZapchast extends Zapchast {
    formattedDate: string;
    formattedPrice: string;
}

export default function ZapchastlarPage() {
    const [zapchastlar, setZapchastlar] = useState<FormattedZapchast[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [newPart, setNewPart] = useState({
        nomi: '',
        kod: '',
        soni: 0,
        narxi: 0,
        kelgan_sanasi: new Date().toISOString().split('T')[0]
    });
    const [editPart, setEditPart] = useState<FormattedZapchast | null>(null);
    const [originalEditPart, setOriginalEditPart] = useState<FormattedZapchast | null>(null);
    const [deletePart, setDeletePart] = useState<FormattedZapchast | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // GET - Ma'lumotlarni Supabase dan olish
    useEffect(() => {
        fetchZapchastlar();
    }, []);

    const fetchZapchastlar = async () => {
        setLoading(true);
        try {
            const data = await readJsonFile('zapchastlar.json');
            const formattedParts = data.map((part: Zapchast) => ({
                ...part,
                formattedDate: new Date(part.kelgan_sanasi).toLocaleDateString('uz-UZ'),
                formattedPrice: part.narxi.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }) + ' $'
            }));
            setZapchastlar(formattedParts);
        } catch (error) {
            console.error('Ma\'lumotlarni o\'qishda xatolik:', error);
            setError('Ma\'lumotlarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const filteredParts = zapchastlar.filter((part: FormattedZapchast) =>
        part.nomi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.kod.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Zapchast kodi mavjudligini tekshirish
    const isPartCodeExists = (kod: string, excludeId?: number): boolean => {
        return zapchastlar.some((part: FormattedZapchast) => part.kod === kod && part.id !== excludeId);
    };

    // O'zgarishlarni tekshirish
    const hasChanges = (): boolean => {
        if (!editPart || !originalEditPart) return false;

        return (
            editPart.nomi !== originalEditPart.nomi ||
            editPart.kod !== originalEditPart.kod ||
            editPart.soni !== originalEditPart.soni ||
            editPart.narxi !== originalEditPart.narxi ||
            editPart.kelgan_sanasi !== originalEditPart.kelgan_sanasi
        );
    };

    // CREATE - Yangi zapchast qo'shish
    const handleAddPart = async (): Promise<void> => {
        if (!newPart.nomi.trim()) {
            setError('Zapchast nomini kiriting');
            return;
        }
        if (!newPart.kod.trim()) {
            setError('Zapchast kodini kiriting');
            return;
        }
        if (isPartCodeExists(newPart.kod)) {
            setError('Bu zapchast kodi allaqachon mavjud');
            return;
        }
        if (newPart.soni < 0) {
            setError('Zapchast sonini kiriting');
            return;
        }
        if (newPart.narxi < 0) {
            setError('Zapchast narxini kiriting');
            return;
        }

        setActionLoading(true);
        try {
            const newZapchast = await writeJsonFile('zapchastlar.json', {
                nomi: newPart.nomi.trim(),
                kod: newPart.kod.trim(),
                soni: newPart.soni,
                narxi: newPart.narxi,
                kelgan_sanasi: newPart.kelgan_sanasi
            });

            const formattedPart: FormattedZapchast = {
                ...newZapchast,
                formattedDate: new Date(newZapchast.kelgan_sanasi).toLocaleDateString('uz-UZ'),
                formattedPrice: newZapchast.narxi.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }) + ' $'
            };

            setZapchastlar(prev => [...prev, formattedPart]);
            setNewPart({
                nomi: '',
                kod: '',
                soni: 0,
                narxi: 0,
                kelgan_sanasi: new Date().toISOString().split('T')[0]
            });
            setError('');
            setIsAddDialogOpen(false);
        } catch (error: any) {
            console.error('Xatolik:', error);
            setError(error.message || 'Zapchast qo\'shishda xatolik');
        } finally {
            setActionLoading(false);
        }
    };

    // UPDATE - Zapchastni tahrirlash
    const handleEditPart = async (): Promise<void> => {
        if (!editPart) return;

        // Validatsiya
        if (!editPart.nomi.trim()) {
            setError('Zapchast nomini kiriting');
            return;
        }
        if (!editPart.kod.trim()) {
            setError('Zapchast kodini kiriting');
            return;
        }
        if (isPartCodeExists(editPart.kod, editPart.id)) {
            setError('Bu zapchast kodi allaqachon mavjud');
            return;
        }
        if (editPart.soni < 0) {
            setError('Zapchast sonini kiriting');
            return;
        }
        if (editPart.narxi < 0) {
            setError('Zapchast narxini kiriting');
            return;
        }

        // O'zgarishlarni tekshirish
        if (!hasChanges()) {
            setError('Hech qanday o\'zgarish kiritilmadi');
            return;
        }

        setActionLoading(true);
        try {
            const updatedZapchast = await updateInFile('zapchastlar.json', editPart.id, {
                nomi: editPart.nomi.trim(),
                kod: editPart.kod.trim(),
                soni: editPart.soni,
                narxi: editPart.narxi,
                kelgan_sanasi: editPart.kelgan_sanasi
            });

            const formattedPart: FormattedZapchast = {
                ...updatedZapchast,
                formattedDate: new Date(updatedZapchast.kelgan_sanasi).toLocaleDateString('uz-UZ'),
                formattedPrice: updatedZapchast.narxi.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }) + ' $'
            };

            setZapchastlar(prev =>
                prev.map(p => p.id === formattedPart.id ? formattedPart : p)
            );

            setEditPart(null);
            setOriginalEditPart(null);
            setError('');
            setIsEditDialogOpen(false);
        } catch (error: any) {
            console.error('Xatolik:', error);
            setError(error.message || 'Zapchastni yangilashda xatolik');
        } finally {
            setActionLoading(false);
        }
    };

    // DELETE - Zapchastni o'chirish
    const handleDeletePart = async (): Promise<void> => {
        if (!deletePart) return;

        setActionLoading(true);
        try {
            await deleteFromFile('zapchastlar.json', deletePart.id);

            setZapchastlar(prev => prev.filter(p => p.id !== deletePart.id));
            setDeletePart(null);
            setIsDeleteDialogOpen(false);
        } catch (error: any) {
            console.error('Xatolik:', error);
            setError(error.message || 'Zapchastni o\'chirishda xatolik');
        } finally {
            setActionLoading(false);
        }
    };

    // Tahrirlashni boshlash
    const handleEditClick = (part: FormattedZapchast): void => {
        setEditPart({ ...part });
        setOriginalEditPart({ ...part });
        setError('');
        setIsEditDialogOpen(true);
    };

    // O'chirishni boshlash
    const handleDeleteClick = (part: FormattedZapchast): void => {
        setDeletePart(part);
        setIsDeleteDialogOpen(true);
    };

    const handleAddDialogOpen = (): void => {
        setNewPart({
            nomi: '',
            kod: '',
            soni: 0,
            narxi: 0,
            kelgan_sanasi: new Date().toISOString().split('T')[0]
        });
        setError('');
        setIsAddDialogOpen(true);
    };

    // Input o'zgarishlari uchun handlerlar
    const handleNewPartChange = (field: keyof typeof newPart, value: string | number): void => {
        setNewPart(prev => ({
            ...prev,
            [field]: value
        }));
        if (error) setError('');
    };

    const handleEditPartChange = (field: keyof Zapchast, value: string | number): void => {
        if (editPart) {
            setEditPart(prev => prev ? { ...prev, [field]: value } : null);
        }
        if (error) setError('');
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Zapchastlar</h1>
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
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Zapchastlar</h1>

                {/* CREATE - Yangi zapchast qo'shish dialogi */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-base py-2 px-4 h-auto whitespace-nowrap"
                            onClick={handleAddDialogOpen}
                        >
                            <Plus className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                            Yangi Zapchast
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Yangi Zapchast Qo'shish</DialogTitle>
                            <DialogDescription>
                                Zapchast ma'lumotlarini to'ldiring.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleAddPart();
                        }}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="nomi">Zapchast Nomi</Label>
                                    <Input
                                        id="nomi"
                                        placeholder="Masalan: Tormoz diski"
                                        value={newPart.nomi}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleNewPartChange('nomi', e.target.value)
                                        }
                                        className={error && !newPart.nomi ? 'border-red-500' : ''}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="kod">Zapchast Kodi</Label>
                                    <Input
                                        id="kod"
                                        placeholder="Masalan: 1234"
                                        value={newPart.kod}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleNewPartChange('kod', e.target.value)
                                        }
                                        className={error && !newPart.kod ? 'border-red-500' : ''}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="soni">Soni</Label>
                                        <Input
                                            id="soni"
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={newPart.soni}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleNewPartChange('soni', parseInt(e.target.value) || 0)
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="narxi">Narxi ($)</Label>
                                        <Input
                                            id="narxi"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={newPart.narxi}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleNewPartChange('narxi', parseFloat(e.target.value) || 0)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="kelgan_sanasi">Kelgan Sana</Label>
                                    <Input
                                        id="kelgan_sanasi"
                                        type="date"
                                        value={newPart.kelgan_sanasi}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleNewPartChange('kelgan_sanasi', e.target.value)
                                        }
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
                                    disabled={!newPart.nomi || !newPart.kod || newPart.soni < 0 || newPart.narxi < 0 || actionLoading}
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

            {/* UPDATE - Tahrirlash dialogi */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Zapchastni Tahrirlash</DialogTitle>
                        <DialogDescription>
                            Zapchast ma'lumotlarini o'zgartiring.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleEditPart();
                    }}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editNomi">Zapchast Nomi</Label>
                                <Input
                                    id="editNomi"
                                    placeholder="Masalan: Tormoz diski"
                                    value={editPart?.nomi || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleEditPartChange('nomi', e.target.value)
                                    }
                                    className={error && !editPart?.nomi ? 'border-red-500' : ''}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="editKod">Zapchast Kodi</Label>
                                <Input
                                    id="editKod"
                                    placeholder="Masalan: 1234"
                                    value={editPart?.kod || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleEditPartChange('kod', e.target.value)
                                    }
                                    className={error && !editPart?.kod ? 'border-red-500' : ''}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="editSoni">Soni</Label>
                                    <Input
                                        id="editSoni"
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={editPart?.soni ?? 0}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleEditPartChange('soni', parseInt(e.target.value) || 0)
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="editNarxi">Narxi ($)</Label>
                                    <Input
                                        id="editNarxi"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={editPart?.narxi ?? 0}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleEditPartChange('narxi', parseFloat(e.target.value) || 0)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="editKelgan_sanasi">Kelgan Sana</Label>
                                <Input
                                    id="editKelgan_sanasi"
                                    type="date"
                                    value={editPart?.kelgan_sanasi?.split('T')[0] || new Date().toISOString().split('T')[0]}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleEditPartChange('kelgan_sanasi', e.target.value)
                                    }
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
                                disabled={
                                    !editPart?.nomi ||
                                    !editPart?.kod ||
                                    (editPart?.soni ?? 0) < 0 ||
                                    (editPart?.narxi ?? 0) < 0 ||
                                    actionLoading ||
                                    !hasChanges()
                                }
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

            {/* DELETE - O'chirish dialogi */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Zapchastni O'chirish</DialogTitle>
                        <DialogDescription>
                            Rostan ham <strong>{deletePart?.nomi}</strong> zapchastini o'chirmoqchimisiz?
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
                            onClick={handleDeletePart}
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

            {/* READ - Ma'lumotlarni ko'rsatish */}
            <Card className="shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <CardTitle className="text-lg lg:text-xl">Zapchastlar Ro'yxati</CardTitle>
                        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-4 md:space-y-0">
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Nomi yoki kodi bo'yicha qidirish..."
                                    className="pl-9 h-10 lg:h-11 text-base w-full"
                                    value={searchTerm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="text-base text-muted-foreground font-medium whitespace-nowrap">
                                Jami: {filteredParts.length} ta
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20 font-semibold text-base">T/R</TableHead>
                                <TableHead className="font-semibold text-base">Nomi</TableHead>
                                <TableHead className="w-24 font-semibold text-base">Kodi</TableHead>
                                <TableHead className="w-28 text-center font-semibold text-base">Soni</TableHead>
                                <TableHead className="w-36 font-semibold text-base">Narxi</TableHead>
                                <TableHead className="w-36 font-semibold text-base">Kelgan Sana</TableHead>
                                <TableHead className="w-28 font-semibold text-base">Amallar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredParts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-base">
                                        {searchTerm ? 'Hech narsa topilmadi' : 'Hozircha zapchastlar mavjud emas'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredParts.map((part: FormattedZapchast, index) => (
                                    <TableRow key={part.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium py-3 text-base">{index + 1}</TableCell>
                                        <TableCell className="font-semibold py-3 text-base">{part.nomi}</TableCell>
                                        <TableCell className="py-3 text-base">{part.kod}</TableCell>
                                        <TableCell className="text-center py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${part.soni < 5
                                                ? 'bg-red-100 text-red-800 border border-red-200'
                                                : part.soni < 10
                                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                    : 'bg-green-100 text-green-800 border border-green-200'
                                                }`}>
                                                {part.soni} ta
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-bold py-3 text-blue-700 text-base">{part.formattedPrice}</TableCell>
                                        <TableCell className="py-3 text-base">{part.formattedDate}</TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 w-9 p-0"
                                                    onClick={() => handleEditClick(part)}
                                                    disabled={actionLoading}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteClick(part)}
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
