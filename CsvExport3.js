import { Poppins } from 'next/font/google';
import Papa from 'papaparse';
import React from "react"

const poppins = Poppins({
    weight: ['100', '400', '500', '600', '700', '800'],
    subsets: ['latin'],
});

const CsvExport3 = ({ data, fileName }) => {
    const handleExport = () => {
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, fileName);
        } else {
            link.href = URL.createObjectURL(blob);

            link.style = 'visibility:hidden';
            link.download = fileName;

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
        }
    };

    return (


        <div onClick={handleExport}
            className="mb-20 px-12 py-4 space-x-4 flex justify-center items-center  shadow-2xl rounded-xl bg-gray-800 hover:cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300"
        >
            <h1 className={`${poppins.className} text-center text-lg font-semibold text-gray-200`}>
                Download Inventory CSV
            </h1>
            <img src="/download.png" alt="download" className='w-7 h-7' />

        </div>

    );
};

export default CsvExport3;
