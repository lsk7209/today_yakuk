"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
    id: string;
    status: string;
};

export default function QueueActions({ id, status }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/queue/${id}`, { method: "DELETE" });
            if (res.ok) {
                router.refresh();
            } else {
                alert("삭제 실패");
            }
        } catch {
            alert("오류 발생");
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!confirm("지금 즉시 발행하시겠습니까? (예약 시간이 무시됩니다)")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/queue/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "published" }),
            });
            if (res.ok) {
                router.refresh();
            } else {
                alert("발행 실패");
            }
        } catch {
            alert("오류 발생");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex space-x-2">
            {status === "pending" && (
                <button
                    onClick={handlePublish}
                    disabled={loading}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                >
                    즉시 발행
                </button>
            )}
            <button
                onClick={handleDelete}
                disabled={loading}
                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
            >
                삭제
            </button>
        </div>
    );
}
