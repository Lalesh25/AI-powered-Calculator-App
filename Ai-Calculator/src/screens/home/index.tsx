import { useEffect, useRef, useState } from "react";
import { SWATCHES } from "../../../constants";
import {ColorSwatch,Group} from '@mantine/core';
import { Button } from "@/components/ui/button";
import axios from 'axios';
import Draggable from 'react-draggable';
// import { setDefaultResultOrder } from "dns";

interface Response {
    expr:string,
    result:string,
    assign:boolean,
}

interface GeneratedResult {
    expression:string;
    answer:string;
}

export default function Home() {
    // Helper function to add spaces before uppercase letters
    const addSpacesToExpression = (expr: string): string => {
        return expr.replace(/([a-z])([A-Z])/g, '$1 $2');
    };

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('rgb(255,255,255)');
    const [reset, setReset] = useState(false);
    const [result, setResult] = useState<GeneratedResult>();
    const [dictOfVars, setDictOfVars] = useState({});
    const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
    const [latexExpression, setLatexExpression] = useState<Array<string>>([]);

    useEffect(() => {
        if (latexExpression.length > 0 && window.MathJax) {
            setTimeout(() => {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
            }, 0);
        }
    }, [latexExpression]);

    useEffect(() => {
        if (result) {
            renderLatexToCanvas(result.expression, result.answer);
        }
    }, [result]);

    useEffect(() => {
        if (reset) {
            resetCanvas();
            setLatexExpression([]);
            setResult(undefined);
            setDictOfVars({});
            setReset(false);
        }
    }, [reset]);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight - canvas.offsetTop;
                ctx.lineCap = 'round';
                ctx.lineWidth = 3;
                ctx.strokeStyle = color;
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            window.MathJax.Hub.Config({
                tex2jax: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
            });
        };

        return () => {
            document.head.removeChild(script);
        };
    }, [color]);

    const renderLatexToCanvas = (expression: string, answer: string) => {
        const latex = `\\(\\LARGE{\\text{${expression}} = ${answer}}\\)`;
        setLatexExpression([...latexExpression, latex]);

        // Clear the main canvas
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const sendData = async () => {
        const canvas = canvasRef.current;

        if (canvas) {
            const response = await axios({
                method: 'post',
                url: `${import.meta.env.VITE_API_URL}/calculate`,
                data: {
                    image: canvas.toDataURL('image/png'),
                    dict_of_vars: dictOfVars,
                }
            });

            const resp = await response.data;
            resp.data.forEach((data: Response) => {
                if (data.assign === true) {
                    setDictOfVars({
                        ...dictOfVars,
                        [data.expr]: data.result
                    });
                }
            });

            const ctx = canvas.getContext('2d');
            const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
            let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;

            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const i = (y * canvas.width + x) * 4;
                    if (imageData.data[i + 3] > 0) {  // If pixel is not transparent
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            setLatexPosition({ x: centerX, y: centerY });
            resp.data.forEach((data: Response) => {
                setTimeout(() => {
                    setResult({
                        expression: addSpacesToExpression(data.expr),
                        answer: data.result
                    });
                }, 1000);
            });
        }
    };

    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.background = 'black';
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                setIsDrawing(true);
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) {
            return;
        }
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = color;
                ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                ctx.stroke();
            }
        }
    };

    return (
        <>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '1rem',
                padding: '1rem 2rem',
                backgroundColor: '#1a202c',
                zIndex: 1000,
                alignItems: 'center',
            }}>
                <button
                    onClick={() => setReset(true)}
                    style={{
                        backgroundColor: '#000',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'background-color 0.3s ease',
                    }}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = '#2d3748')}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = '#000')}
                >
                    Reset
                </button>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                }}>
                    {SWATCHES.map((swatchColor: string) => (
                        <div
                            key={swatchColor}
                            style={{
                                width: '1.5rem',
                                height: '1.5rem',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                border: '2px solid transparent',
                                backgroundColor: swatchColor,
                                transition: 'border-color 0.3s ease',
                            }}
                            onClick={() => setColor(swatchColor)}
                            onMouseOver={e => (e.currentTarget.style.borderColor = '#63b3ed')}
                            onMouseOut={e => (e.currentTarget.style.borderColor = 'transparent')}
                        />
                    ))}
                </div>

                <button
                    onClick={sendData}
                    style={{
                        backgroundColor: '#000',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'background-color 0.3s ease',
                    }}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = '#2d3748')}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = '#000')}
                >
                    Calculate
                </button>
            </div>
            <canvas
                ref={canvasRef}
                id='canvas'
                style={{
                    position: 'absolute',
                    top: '4.5rem',
                    left: 0,
                    width: '100%',
                    height: 'calc(100vh - 4.5rem)',
                    border: '4px solid #4a5568',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    backgroundColor: '#000',
                }}
                onMouseDown={startDrawing}
                onMouseOut={stopDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
            />
            {latexExpression && latexExpression.map((latex, index) => (
                <Draggable
                    key={index}
                    defaultPosition={{ x: latexPosition.x, y: latexPosition.y + index * 40 }}
                    onStop={(e, data) => setLatexPosition({ x: data.x, y: data.y })}
                >
                    <div style={{
                        position: 'absolute',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(45, 55, 72, 0.8)',
                        color: '#fff',
                        borderRadius: '0.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                        cursor: 'move',
                        userSelect: 'none',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                    }}>
                        <div className="latex-content">{latex}</div>
                    </div>
                </Draggable>
            ))}
        </>
    );
}
