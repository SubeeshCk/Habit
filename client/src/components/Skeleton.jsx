import '../styles/Skeleton.css';

const Skeleton = ({ width, height, borderRadius, style }) => {
    return (
        <div
            className="skeleton"
            style={{
                width,
                height,
                borderRadius: borderRadius || 'var(--radius-sm)',
                ...style
            }}
        />
    );
};

export default Skeleton;
