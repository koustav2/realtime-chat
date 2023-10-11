import ClockLoader from 'react-spinners/ClockLoader';

export default function loading() {
    return (
        <div className="min-h-screen flex justify-center items-center">
            <ClockLoader color="#36d7b7" size={70} />
        </div>
    );
}