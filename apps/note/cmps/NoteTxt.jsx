export function NoteTxt({ info }) {
    return (
        <div className="note-txt">
            {info.title && <h3>{info.title}</h3>}
            <p>{info.txt}</p>
        </div>
    )
} 