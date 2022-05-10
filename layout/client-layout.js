import Navbar from "@/components/navbar";

export default function ClientLayout({ children }) {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
