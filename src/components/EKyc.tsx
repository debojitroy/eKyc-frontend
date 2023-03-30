import React, {useEffect} from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Card from "@mui/material/Card";
import {styled} from "@mui/material/styles";
import {useInput} from "../utils/forms";
import {Toast} from "../utils/notifications";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import WebcamCapture from './WebcamCapture';
import SimpleBackdrop from "./SimpleBackdrop";
import {Auth} from "aws-amplify";

const Field = styled(TextField)({
    margin: "10px 0",
});

const SelfieButton = styled(Button)({
    margin: "10px 0",
});

const WebCamStyled = styled(WebcamCapture)({
    margin: "10px 0",
})

const EKyc: React.FC = ({}) => {
    let fileReader: any;
    const [loading, setLoading] = React.useState(false);
    const [idType, setIdType] = React.useState<string>('AADHAAR');
    const [idImageSrc, setIdImageSrc] = React.useState<string>();
    const [imageSrc, setImageSrc] = React.useState<string>();
    const [toggleCamera, setCameraToggle] = React.useState(false);
    const [pollId, setPollerId] = React.useState<number>();
    const [completed, setCompleted] = React.useState<boolean>(false);

    const {value: name, bind: bindName, reset: resetName} = useInput("");
    const {value: dob, bind: bindDOB, reset: resetDOB} = useInput("");
    const {value: idNumber, bind: bindIdNumber, reset: resetIdNumber} = useInput("");

    useEffect(() => {
        if (completed) {
            console.log('Clearing timer...');
            clearInterval(pollId);
            setLoading(false);
            setCompleted(false);
        } else {
            console.log('Not yet complete...');
        }
    }, [completed, pollId]);

    const handleFileRead = () => {
        const content = fileReader.result;
        setIdImageSrc(content);
    };

    const handleFileChosen = (file: any) => {
        fileReader = new FileReader();
        fileReader.onloadend = handleFileRead;
        fileReader.readAsDataURL(file);
    };

    const captureWebcamImage = async (imageSrc: string) => {
        setImageSrc(imageSrc);
        setCameraToggle(false);
    }

    const pollStatus = async (requestId: string) => {
        let complete = false;

        try {
            const user: any = await Auth.currentAuthenticatedUser();

            const response = await axios.get(`https://l17lpqi6g0.execute-api.ap-south-1.amazonaws.com/ekyc?request_id=${requestId}`, {
                withCredentials: true,
                headers: {
                    'Authorization': user.signInUserSession.idToken.jwtToken,
                }
            });

            const responseData = response.data;

            complete = responseData.complete;

            if (complete) {
                if (responseData.success) {
                    Toast("KYC Success!!", "Your KYC was successful", "success");
                } else {
                    Toast("KYC Failed!!", responseData.error ?? "Your KYC Failed", "danger");
                }

                setCompleted(true);
            } else {
                console.log('Still processing...');
            }
        } catch (error: any) {
            console.error('Failed to poll request: ', error);
            Toast("Oops!!", error.data ? error.data.message : "Internal Server Error occurred", "danger");
            setCompleted(true);
        }
    }

    const handleSubmit = async (e: React.SyntheticEvent<Element, Event>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const request = {
                name,
                date_of_birth: dob,
                id_type: idType,
                id_number: idNumber,
                id_front: idImageSrc!.split(';base64,').pop(),
                selfie: imageSrc!.split(';base64,').pop(),
            }

            const user: any = await Auth.currentAuthenticatedUser();

            // Post eKyc Request
            const response = await axios.post('https://l17lpqi6g0.execute-api.ap-south-1.amazonaws.com/ekyc', request, {
                withCredentials: true,
                headers: {
                    'Authorization': user.signInUserSession.idToken.jwtToken,
                }
            });

            const rawData = response.data;

            const poll_id: number = setInterval(async () => {
                await pollStatus(rawData.requestId)
            }, 1000) as any;

            setPollerId(poll_id);
        } catch (error: any) {
            console.error('Failed to submit request: ', error);
            Toast("Error!!", error.data ? error.data.message : error.message, "danger");
            setLoading(false);
        } finally {
            //Clear everything
            resetName();
            resetDOB();
            resetIdNumber();
            setIdImageSrc(undefined);
            setImageSrc(undefined);
            setIdType('AADHAAR');
        }
    };

    return (
        <Card style={{width: 500, margin: "10px auto", padding: "40px"}}>
            <form
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
                onSubmit={handleSubmit}
            >
                <h1 style={{fontSize: "22px", fontWeight: 800}}>
                    {" "}
                    Start a new KYC
                </h1>
                <Field label="Name" {...bindName} />
                <Field label="Date of Birth" {...bindDOB} />
                <Field label="Id Number" {...bindIdNumber} />
                <FormControl style={{marginTop: '20px'}}>
                    <FormLabel id="demo-radio-buttons-group-label">ID Type</FormLabel>
                    <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        defaultValue={'AADHAAR'}
                        name="radio-buttons-group"
                        onChange={(event) => {
                            const idType = event.target.value;
                            console.log('Id Type: ', idType);
                            setIdType(idType);
                        }}
                    >
                        <FormControlLabel value="AADHAAR" control={<Radio/>} label="Aadhaar"/>
                        <FormControlLabel value="PAN" control={<Radio/>} label="PAN"/>
                    </RadioGroup>
                </FormControl>
                <FormLabel style={{marginTop: '20px'}} id="demo-radio-buttons-group-label">Upload ID</FormLabel>
                <Field
                    type={"file"}
                    //@ts-ignore
                    accept='.jpg'
                    onChange={e => handleFileChosen((e.target as any).files[0])}/>
                {!toggleCamera && imageSrc && imageSrc !== "" &&
                    <img style={{width: '400px', height: '400px', margin: '10px 0', border: '1px solid'}}
                         alt={"Captured Selfie"} src={imageSrc}/>}
                {!toggleCamera && <SelfieButton variant="contained" onClick={() => setCameraToggle(true)}
                                                disabled={loading}>Take Selfie</SelfieButton>}
                {toggleCamera && <WebCamStyled getImageSrc={captureWebcamImage}/>}
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    type="submit"
                    disabled={loading}
                >
                    Submit KYC
                </Button>
                <SimpleBackdrop open={loading}/>
            </form>
        </Card>
    );
}

export default EKyc;