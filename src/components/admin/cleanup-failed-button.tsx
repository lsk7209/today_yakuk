"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CleanupFailedButton() {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleCleanup = async () => {
        if (!confirm("실패한 모든 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch("/api/admin/queue/cleanup", {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "삭제 실패");
            }

            alert(data.message);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("삭제 중 오류가 발생했습니다.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleCleanup}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
            {isDeleting ? "삭제 중..." : "실패 내역 일괄 삭제"}
        </button>
    );
}
