import { useState, useRef, useImperativeHandle } from 'react';

/**
 * Drop-in replacement for @pathofdev/react-tag-input.
 * API: <TagInput tags={[]} onChange={(newTags) => {}} placeholder="" removeOnBackspace={true} />
 */
function TagInput({ tags = [], onChange, placeholder = '', removeOnBackspace = true, ref }) {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => inputRef.current);

    const safeTags = Array.isArray(tags) ? tags : [];

    const addTag = (value) => {
        const trimmed = value.trim();
        if (trimmed && !safeTags.includes(trimmed)) {
            onChange([...safeTags, trimmed]);
        }
        setInputValue('');
    };

    const removeTag = (index) => {
        const newTags = safeTags.filter((_, i) => i !== index);
        onChange(newTags);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && removeOnBackspace && inputValue === '' && safeTags.length > 0) {
            removeTag(safeTags.length - 1);
        }
    };

    return (
        <div className="d-flex flex-wrap align-items-center border rounded p-1 bg-background text-foreground" style={{ minHeight: '38px', gap: '4px' }}>
            {safeTags.map((tag, index) => (
                <span key={index} className="badge bg-primary d-flex align-items-center" style={{ fontSize: '0.85em', padding: '5px 8px' }}>
                    {tag}
                    <button
                        type="button"
                        className="btn-close btn-close-white ms-1"
                        style={{ fontSize: '0.6em' }}
                        onClick={() => removeTag(index)}
                        aria-label={`Quitar ${tag}`}
                    />
                </span>
            ))}
            <input
                ref={inputRef}
                type="text"
                className="border-0 flex-grow-1 bg-transparent text-foreground"
                style={{ outline: 'none', minWidth: '120px', padding: '4px' }}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => { if (inputValue.trim()) addTag(inputValue); }}
                placeholder={safeTags.length === 0 ? placeholder : ''}
                aria-label={placeholder || 'Etiquetas'}
            />
        </div>
    );
}

export default TagInput;
