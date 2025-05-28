import { Header } from "@/components/header";
import { VideoPlayer } from "@/components/video-player";
import { Suspense } from "react";

export default async function PlayerPage({
    searchParams,
}: {
    searchParams: { token?: string; username?: string; ip?: string };
}) {
    const token = searchParams.token || "";
    const username = searchParams.username || "";
    const ip = searchParams.ip || "";

    return (
        <main className="min-h-screen flex flex-col">
            <Header username={username} />
            <div className="flex-1 flex items-center justify-center p-4">
                <Suspense fallback={<div>Loading player...</div>}>
                    <VideoPlayer token={token} username={username} ip={ip} />
                </Suspense>
            </div>
        </main>
    );
}
