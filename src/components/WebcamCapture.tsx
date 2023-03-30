import React from "react";

import Button from '@mui/material/Button';
import Webcam from 'react-webcam'

export interface WebcamProps {
    getImageSrc: (imageBase64: string) => Promise<void>;
}

const videoConstraints = {
    width: 400,
    height: 400,
    facingMode: "user"
};

const WebcamCapture: React.FC<WebcamProps> = ({getImageSrc}) => {
    const webcamRef = React.useRef(null);
    const capture = React.useCallback(
        async () => {
            if (webcamRef && webcamRef.current) {
                const imageSrc = (webcamRef.current as any).getScreenshot();

                await getImageSrc(imageSrc);
            } else {
                console.error("Webcam i null");
            }

        },
        [webcamRef, getImageSrc]
    );
    return (
        <>
            <Webcam
                audio={false}
                height={400}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={400}
                videoConstraints={videoConstraints}
            />
            <Button style={{margin: '10px 0'}} variant="contained" onClick={capture}>Capture photo</Button>
        </>
    );
}

export default WebcamCapture;