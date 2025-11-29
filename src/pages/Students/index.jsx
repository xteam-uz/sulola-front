import { useEffect } from "react";
import { Plus, MoreVertical } from "lucide-react";
import { FooterNavbar } from "../../components/FooterNavbar";
import { TopHeader } from "../../components/ui/TopHeader";
import { useStateContext } from "../../contexts/ContextProvider";
import { format } from "date-fns";

export const Students = () => {
    const { user, allStudents, allStudentsLoading, fetchAllStudents } =
        useStateContext();

    useEffect(() => {
        const userId = user?.[0]?.bot_user?.user_id;
        if (userId) {
            fetchAllStudents(userId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <TopHeader />

            {/* Students List */}
            <div className="flex-1 px-4 py-5 space-y-3">
                {allStudentsLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (allStudents || []).length > 0 ? (
                    (allStudents || []).map((student) => (
                        <div
                            key={student.id || student.bot_user_id}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-gray-800 font-semibold">
                                        {student.first_name} {student.last_name}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        ID: {student.bot_user_id || student.id}
                                    </p>
                                    {student.created_at && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Qo'shilgan:{" "}
                                            {format(
                                                new Date(student.created_at),
                                                "dd.MM.yyyy",
                                            )}
                                        </p>
                                    )}
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <p>Hozircha o'quvchilar yo'q</p>
                    </div>
                )}
            </div>

            {/* Add Button */}
            <button className="fixed bottom-20 right-5 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all">
                <Plus size={22} />
            </button>

            {/* Bottom Navigation */}
            <FooterNavbar />
        </div>
    );
};
