import React, { useState } from "react";
import { EyeOutlined } from "@ant-design/icons";
import { List, Button, Modal, message } from "antd";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

const ViewerDashboard: React.FC = () => {
  const [fileList, setFileList] = useState<any>(() => {
    // Initialize from localStorage or use an empty array
    const storedData = localStorage.getItem("jsonFiles");
    return storedData ? JSON.parse(storedData) : [];
  }); const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewingFile, setViewingFile] = useState<any>(null);
  const [fileContent, setFileContent] = useState("");

  const handleView = async (file: any) => {

    const fileType = file.file.type;

    if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || // .docx
      fileType === "application/msword" // .doc
    ) {
      // View Word files
      const reader = new FileReader();
      reader.onload = async (e: any) => {
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
      reader.onload = (e: any) => {
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




  return (
    <div>
      <h1>Viewer Dashboard</h1>
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
  );
};

export default ViewerDashboard;
