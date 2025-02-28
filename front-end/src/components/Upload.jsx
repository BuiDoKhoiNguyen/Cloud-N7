import { Button, Tooltip } from "antd";
import {
  CameraOutlined,
  VideoCameraOutlined,
  CloseOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { FileInput } from "./ui";

function Record({ handleVideo, setOpen }) {
  const [state, setState] = useState(0);
  const [recorder, setRecorder] = useState();
  const [currentStream, setCurrentStream] = useState();
  const [recordedStream, setRecordedStream] = useState();
  const currentRef = useRef();

  useEffect(() => {
    if (state == 0) {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((s) => {
          if (currentStream) currentStream.getTracks().forEach((e) => e.stop());
          currentRef.current.srcObject = s;
          setCurrentStream(s);
        });
    }
  }, [state]);

  const handleExit = () => {
    if (currentStream) {
      currentStream.getTracks().forEach((e) => e.stop());
      currentRef.current.srcObject = null;
    }
    setCurrentStream(null);
    setOpen(false);
  };

  const handleStart = () => {
    if (currentStream) {
      const recorder = new MediaRecorder(currentStream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () =>
        setRecordedStream(new Blob(chunks, { type: "video/webm" }));
      recorder.start();
      setRecorder(recorder);
      setState(1);
    }
  };

  const handlePause = () => {
    recorder.pause();
    setState(2);
  };

  const handleResume = () => {
    recorder.resume();
    setState(1);
  };

  const handleStop = () => {
    recorder.stop();
    setCurrentStream(null);
    setState(3);
  };

  const handleDone = () => {
    handleVideo(recordedStream);
    setCurrentStream(null);
    setOpen(false);
  };

  const handleCancel = () => {
    setCurrentStream(null);
    setRecordedStream(null);
    setState(0);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 justify-center">
        <Button danger onClick={handleExit}>
          Thoát
        </Button>
        {state == 0 && <Button onClick={handleStart}>Bắt đầu quay</Button>}
        {state != 0 && (
          <Button danger onClick={handleCancel}>
            Hủy
          </Button>
        )}
        {state == 1 && <Button onClick={handlePause}>Tạm dừng</Button>}
        {state == 2 && <Button onClick={handleResume}>Tiếp tục</Button>}
        {(state == 1 || state == 2) && (
          <Button onClick={handleStop}>Dừng</Button>
        )}
        {state == 3 && (
          <Button type="primary" onClick={handleDone}>
            Chọn video này
          </Button>
        )}
      </div>
      <video
        muted
        className={`${currentStream ? "block" : "hidden"}`}
        ref={currentRef}
        autoPlay={true}
      ></video>
      {state == 3 && recordedStream && (
        <video
          src={URL.createObjectURL(recordedStream)}
          autoPlay={true}
          controls={true}
        ></video>
      )}
    </div>
  );
}

function Capture({ setOpen, handleCapture }) {
  const [state, setState] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const cameraRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    let stream;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((s) => {
        stream = s;
        cameraRef.current.srcObject = s;
      });
    return () => {
      if (stream) {
        stream.getTracks().forEach((e) => e.stop());
      }
    };
  }, []);

  const handleExit = () => {
    setOpen(false);
  };

  const takePhoto = () => {
    const video = cameraRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      setCapturedImage(blob);
      setState(1);
    }, "image/jpeg");
  };

  const handleDone = () => {
    handleCapture(capturedImage);
    setOpen(false);
  };

  const handleCancel = () => {
    setCapturedImage(null);
    setState(0);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 justify-center">
        <Button danger onClick={handleExit}>
          Thoát
        </Button>
        {state == 0 && (
          <Button type="primary" onClick={takePhoto}>
            Chụp
          </Button>
        )}
        {state == 1 && (
          <Button type="primary" onClick={handleDone}>
            Thêm
          </Button>
        )}
        {state == 1 && <Button onClick={handleCancel}>Huỷ</Button>}
      </div>
      <video
        muted
        ref={cameraRef}
        autoPlay={true}
        style={{ display: state === 0 ? "block" : "none" }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {state == 1 && capturedImage && (
        <img src={URL.createObjectURL(capturedImage)} alt="Captured" />
      )}
    </div>
  );
}

export default function ({ files, setFiles }) {
  const [openRecord, setOpenRecord] = useState(false);
  const [openCapture, setOpenCapture] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex ">
        <Tooltip title="Capture image">
          <Button
            type="text"
            icon={<CameraOutlined />}
            onClick={() => setOpenCapture(true)}
          />
        </Tooltip>

        <Tooltip title="Record video">
          <Button
            type="text"
            icon={<VideoCameraOutlined />}
            onClick={() => setOpenRecord(true)}
          />
        </Tooltip>

        <FileInput
          onChange={(e) => setFiles((t) => [...t, ...e.target.files])}
        ></FileInput>
      </div>
      {openCapture && (
        <Capture
          setOpen={setOpenCapture}
          handleCapture={(t) => setFiles((a) => [...a, t])}
        />
      )}
      {openRecord && (
        <Record
          setOpen={setOpenRecord}
          handleVideo={(t) => setFiles((a) => [...a, t])}
        />
      )}
      {files.map((e, i) => (
        <div key={i} className="relative rounded-md overflow-hidden w-full">
          <div className="top-2 right-2 absolute">
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() =>
                setFiles((t) => t.filter((_, index) => index !== i))
              }
              size="small"
              className="bg-white bg-opacity-80 hover:bg-opacity-100"
            />
          </div>
          {e.type.split("/")[0] == "image" ? (
            <img
              key={e}
              src={URL.createObjectURL(e)}
              alt="uploaded"
              className="w-full"
            />
          ) : e.type.split("/")[0] == "video" ? (
            <video
              key={i}
              src={URL.createObjectURL(e)}
              controls={true}
              className="w-full"
            />
          ) : (
            <div className="flex flex-col items-center p-4 bg-gray-50">
              <FileOutlined className="text-2xl mb-2" />
              <div className="text-sm text-gray-600">{e.name}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
