'use client'
import GridLoader from 'react-spinners/GridLoader';

export default function Loading() {
    return (
        <div className=" min-h-screen flex justify-center items-center">
            <GridLoader
                color="#2936ca"
                size={60}
            />
        </div>
    );
}