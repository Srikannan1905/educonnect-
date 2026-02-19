import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-red-100 p-4 rounded-full">
                                <AlertTriangle className="text-red-600" size={48} />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
                        <p className="text-gray-600 mb-6">
                            We encountered an unexpected error. Please try reloading the page.
                        </p>
                        <div className="bg-gray-100 p-4 rounded text-left overflow-auto max-h-40 mb-6 text-xs font-mono text-gray-700">
                            {this.state.error?.toString()}
                        </div>
                        <button
                            onClick={() => {
                                localStorage.clear(); // Clear storage as it might be the cause
                                window.location.reload();
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Clear Cache & Reload
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="mt-2 block w-full text-blue-600 hover:underline"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
