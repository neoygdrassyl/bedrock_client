import { useId } from 'react';

/**
 * Drop-in replacement for react-html-datalist using native HTML datalist.
 * API: <HTMLDatalist name="" onChange={(e) => {}} classNames="" options={[{text, value}]} />
 */
export default function HTMLDatalist({ name = '', onChange, classNames = 'form-control', options = [] }) {
    const listId = useId();
    const safeOptions = Array.isArray(options) ? options : [];

    const handleChange = (e) => {
        const inputVal = e.target.value;
        const matched = safeOptions.find(opt => opt.text === inputVal);
        if (onChange) {
            onChange({
                target: {
                    text: matched ? matched.text : inputVal,
                    value: matched ? matched.value : inputVal,
                }
            });
        }
    };

    return (
        <>
            <input
                type="text"
                name={name}
                className={classNames}
                list={listId}
                onChange={handleChange}
                autoComplete="off"
            />
            <datalist id={listId}>
                {safeOptions.map((opt, i) => (
                    <option key={i} value={opt.text}>
                        {opt.text}
                    </option>
                ))}
            </datalist>
        </>
    );
}
