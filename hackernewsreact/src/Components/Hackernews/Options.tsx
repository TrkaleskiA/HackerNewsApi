import React, {  useEffect, useRef } from 'react';
import './options.css';

interface Option {
    id: number;
    text: string;
    score: number;
}

interface OptionsProps {
    pollId: number;
    options: Option[];
    selectedOption: number | null;
    onOptionSelect: (optionId: number) => void;
    onClose: () => void;
    votedOptions: Set<number>;
}

const Options: React.FC<OptionsProps> = ({ options, onOptionSelect, onClose, votedOptions }) => {
    const popupRef = useRef<HTMLDivElement>(null);

    const handleOptionClick = (optionId: number) => {
        onOptionSelect(optionId);
        onClose();
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="options-popup" ref={popupRef}>
            <h6>Poll Options:</h6>
            {options.map(option => (
                <div
                    key={option.id}
                    className={`poll-option ${votedOptions.has(option.id) ? 'selected' : ''}`}
                    onClick={() => handleOptionClick(option.id)}
                >
                    {option.text} - {option.score} points
                </div>
            ))}
        </div>
    );
};

export default Options;
