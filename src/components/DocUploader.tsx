import { useEffect, useState } from "react";
import {
    Upload,
    Button,
    List,
    message,
    Modal
} from "antd";
import {
    EditOutlined,
    DownloadOutlined,
    DeleteOutlined,
    EyeOutlined
} from "@ant-design/icons";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

const DocUploader = () => {

    const [fileList, setFileList] = useState<any>(() => {
        const storedData = localStorage.getItem("jsonFiles");
        return storedData ? JSON.parse(storedData) : [];
    });
    const [viewingFile, setViewingFile] = useState<any>(null);
    const [fileContent, setFileContent] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (fileList) {
            localStorage.setItem('jsonFiles', JSON.stringify(fileList));
        }

        // Retrieve JSON from local storage and parse it
    }, [fileList])


    // Handle file upload
    const handleUpload = (file: any) => {

        const allowedTypes = ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

        // Check if the file type is in the allowed types or if the file name ends with an allowed extension
        if (!allowedTypes.includes(file.type) && !file.name.endsWith(".doc") && !file.name.endsWith(".docx") && !file.name.endsWith(".xls") && !file.name.endsWith(".xlsx")) {
            message.error("Only .doc, .docx, .xls, and .xlsx files are allowed!");
            return false;
        }

        setFileList((prev: any) => (Array.isArray(prev) ? [...prev, { uid: file.uid, name: file.name, file }] : [{ uid: file.uid, name: file.name, file }]));
        return false;
    };

    // Handle file viewing
    const handleView = async (file: any) => {

        const fileType = file.file.type;

        if (
            fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || // .docx
            fileType === "application/msword" // .doc
        ) {
            // View Word files
            const reader = new FileReader();
            reader.onload = async (e:any) => {
                try {
                    const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
                    setFileContent(result.value);
                    setViewingFile(file);
                    setIsModalVisible(true);
                } catch (error) {
                    message.error("Unable to read Word document content.");
                }
            };
            reader.readAsArrayBuffer(file.file);
        } else if (
            fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // .xlsx
            fileType === "application/vnd.ms-excel" // .xls
        ) {
            // View Excel files
            const reader = new FileReader();
            reader.onload = (e:any) => {
                const workbook = XLSX.read(e.target.result, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                setFileContent(JSON.stringify(sheet, null, 2)); // Show Excel content as JSON
                setViewingFile(file);
                setIsModalVisible(true);
            };
            reader.readAsBinaryString(file.file);
        } else {
            message.error("Unsupported file type.");
        }

    };

    // Handle file replacement
    const handleReplace = (uid: any, newFile: any) => {
        const allowedTypes = [
            "application/msword", // .doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "application/vnd.ms-excel", // .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // .xlsx
        ];

        // Check if the file type is in the allowed types or if the file name ends with an allowed extension
        if (!allowedTypes.includes(newFile.type) && !newFile.name.endsWith(".doc") && !newFile.name.endsWith(".docx") && !newFile.name.endsWith(".xls") && !newFile.name.endsWith(".xlsx")) {
            message.error("Only .doc, .docx, .xls, and .xlsx files are allowed!");
            return;
        }

        setFileList((prev: any) =>
            prev.map((item: any) =>
                item.uid === uid ? { ...item, name: newFile.name, file: newFile } : item
            ));
    };

    // Handle file deletion
    const handleDelete = (uid: any) => {
        setFileList((prev: any) => prev.filter((item: any) => item.uid !== uid));
    };

    // Handle file download
    const handleDownload = (file: any) => {
        const url = URL.createObjectURL(file.file);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);

    };

    const contentView = () => {
        try {
            return (
                <>
                    <div style={{ padding: "20px" }}>

                        <Upload.Dragger
                            beforeUpload={handleUpload}
                            multiple={false}
                            showUploadList={false}
                            style={{
                                border: isHovering ? "2px solid #1890ff" : "1px dashed #d9d9d9",
                                backgroundColor: isHovering ? "#e6f7ff" : "#fff",
                                padding: "20px",
                                transition: "all 0.3s ease",
                            }}
                            className="custom-dragger"


                        >
                            <div
                                onDragOver={() => setIsHovering(true)}
                                onDragLeave={() => setIsHovering(false)}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <p>Drag and drop a file here or click to upload</p>
                            </div>
                        </Upload.Dragger>

                        <List
                            itemLayout="horizontal"
                            dataSource={fileList}
                            renderItem={(item: any) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            type="link"
                                            icon={<EyeOutlined />}
                                            onClick={() => handleView(item)}
                                        >
                                            View
                                        </Button>,
                                        <Upload
                                            beforeUpload={(newFile: any) => {
                                                handleReplace(item.uid, newFile);
                                                return false;
                                            }}
                                            showUploadList={false}
                                        >
                                            <Button type="link" icon={<EditOutlined />}>
                                                Replace
                                            </Button>
                                        </Upload>,
                                        <Button
                                            type="link"
                                            icon={<DownloadOutlined />}
                                            onClick={() => handleDownload(item)}
                                        />,
                                        <Button
                                            type="link"
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDelete(item.uid)}
                                        />,
                                    ]}
                                >
                                    <span>{item.name}</span>
                                </List.Item>
                            )}
                        />
                        <Modal
                            title={`Viewing: ${viewingFile?.name}`}
                            visible={isModalVisible}
                            onCancel={() => setIsModalVisible(false)}
                            footer={[
                                <Button key="close" onClick={() => setIsModalVisible(false)}>
                                    Close
                                </Button>,
                            ]}
                        >
                            <pre style={{ whiteSpace: "pre-wrap" }}>{fileContent}</pre>
                        </Modal>
                    </div>
                </>
            )

        } catch (error) {
            console.log("Error in DocUploaderContentView ::", error)
        }
    }

    return (
        <>
            {contentView()}
        </>
    )
};

export default DocUploader;
