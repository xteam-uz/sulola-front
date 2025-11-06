
import { Plus, MoreVertical } from "lucide-react";
import { FooterNavbar } from "../../components/FooterNavbar";
import { TopHeader } from "../../components/ui/TopHeader";

export const Students = () => {
    const students = [
        { id: 77388176, name: "Ali Valiyev", joined: "03.11.2025" },
        { id: 73517929, name: "Palonchi Pistonchiyev", joined: "06.11.2025" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-b-3xl shadow-lg">
                <TopHeader />
                <div>
                    <h2 className="text-lg font-semibold">O‘quvchilarim</h2>
                    <p className="text-blue-100 text-sm">
                        {students.length} ta o‘quvchi
                    </p>
                </div>
            </div>

            {/* Students List */}
            <div className="flex-1 px-4 py-5 space-y-3">
                {students.map((st) => (
                    <div
                        key={st.id}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-gray-800 font-semibold">{st.name}</h3>
                                <p className="text-gray-600 text-sm">ID: {st.id}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Qo‘shilgan: {st.joined}
                                </p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Button */}
            <button className="fixed bottom-20 right-5 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all">
                <Plus size={22} />
            </button>

            {/* Bottom Navigation */}
            <FooterNavbar />
        </div>
    );
};