'use client';

import { Car, Wrench, Hammer } from 'lucide-react';
import { useState, useEffect } from 'react';
import { readJsonFile } from '@/lib/json-utils';

interface StatsData {
    totalCars: number;
    totalSpareParts: number;
    totalOrders: number;
}

interface CarType {
    id: number;
    moshina_nomeri: string;
    created_at: string;
}

interface SparePartType {
    id: number;
    nomi: string;
    kod: string;
    soni: number;
    narxi: number;
    kelgan_sanasi: string;
}

interface OrderType {
    id: number;
    moshina_nomeri: string;
    description: string;
    usta_haqi: number;
    sanasi: string;
    zapchast_soni: number;
    zapchast_kod: string;
}

export default function Home() {
    const [stats, setStats] = useState<StatsData>({
        totalCars: 0,
        totalSpareParts: 0,
        totalOrders: 0
    });
    const [carsData, setCarsData] = useState<CarType[]>([]);
    const [sparePartsData, setSparePartsData] = useState<SparePartType[]>([]);
    const [ordersData, setOrdersData] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Barcha ma'lumotlarni bir vaqtda yuklash
            const [cars, spareParts, orders] = await Promise.all([
                readJsonFile('moshinalar.json'),
                readJsonFile('zapchastlar.json'),
                readJsonFile('servislar.json')
            ]);

            setCarsData(cars);
            setSparePartsData(spareParts);
            setOrdersData(orders);

            // Statistikani hisoblash
            setStats({
                totalCars: cars.length,
                totalSpareParts: spareParts.length,
                totalOrders: orders.length
            });

        } catch (error) {
            console.error('Dashboard maʼlumotlarini yuklashda xatolik:', error);
        } finally {
            setLoading(false);
        }
    };

    const statsData = [
        {
            title: "Mashinalar",
            value: stats.totalCars.toString(),
            icon: Car,
            description: "Jami ro'yxatdan o'tgan mashinalar",
            color: "blue"
        },
        {
            title: "Zapchastlar",
            value: stats.totalSpareParts.toString(),
            icon: Wrench,
            description: "Zapchast turlari soni",
            color: "green"
        },
        {
            title: "Tamirlash",
            value: stats.totalOrders.toString(),
            icon: Hammer,
            description: "Bajarilgan tamirlash ishlari",
            color: "orange"
        }
    ];

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

            {/* Statistikalar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statsData.map((stat, index) => {
                    const Icon = stat.icon;
                    const colorClasses = {
                        blue: "text-blue-600",
                        green: "text-green-600",
                        orange: "text-orange-600"
                    };

                    return (
                        <div
                            key={index}
                            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {stat.title}
                                </h3>
                                <Icon className={`h-5 w-5 ${colorClasses[stat.color as keyof typeof colorClasses]}`} />
                            </div>
                            <div className={`text-2xl font-bold ${colorClasses[stat.color as keyof typeof colorClasses]} mb-1`}>
                                {stat.value}
                            </div>
                            <p className="text-sm text-gray-600">
                                {stat.description}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Qo'shimcha statistikalar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* So'nggi tamirlash ishlari */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">So'nggi Tamirlash Ishlari</h3>
                    <div className="space-y-3">
                        {ordersData.slice(0, 3).map((order) => (
                            <div key={order.id} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Mashina: {order.moshina_nomeri}</p>
                                    <p className="text-sm text-gray-600 line-clamp-2">{order.description}</p>
                                    {order.usta_haqi && order.usta_haqi > 0 && (
                                        <p className="text-sm text-green-600 font-medium mt-1">
                                            Usta haqi: ${order.usta_haqi}
                                        </p>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                    {new Date(order.sanasi).toLocaleDateString('uz-UZ')}
                                </span>
                            </div>
                        ))}
                        {ordersData.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">Hozircha tamirlash ishlari mavjud emas</p>
                        )}
                    </div>
                </div>

                {/* Kam sonli zapchastlar */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Kam Sonli Zapchastlar</h3>
                    <div className="space-y-2">
                        {sparePartsData
                            .filter(part => part.soni < 5)
                            .slice(0, 4)
                            .map((part) => (
                                <div key={part.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                    <div className="flex-1">
                                        <span className="font-medium text-gray-900">{part.nomi}</span>
                                        <span className="text-sm text-gray-500 ml-2">({part.kod})</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${part.soni < 3
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {part.soni} ta
                                    </span>
                                </div>
                            ))}
                        {sparePartsData.filter(part => part.soni < 5).length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">Barcha zapchastlar yetarli miqdorda</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Yangilash tugmasi */}
            <div className="mt-6 flex justify-center">
                <button
                    onClick={loadDashboardData}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Ma'lumotlarni Yangilash
                </button>
            </div>
        </div>
    );
}
