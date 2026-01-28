export default function Loading() {
    return (
        <div className="container min-h-[60vh] flex flex-col items-center justify-center space-y-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 text-xs font-bold">
                        약
                    </div>
                </div>
            </div>
            <p className="text-slate-600 font-bold animate-pulse text-lg">
                약국오늘이 데이터를 불러오고 있습니다...
            </p>
        </div>
    );
}
