export default function LoadingPopup() {
    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-60 flex items-center justify-center z-50">
            <div className="loader"></div>
        </div>
    );
}
