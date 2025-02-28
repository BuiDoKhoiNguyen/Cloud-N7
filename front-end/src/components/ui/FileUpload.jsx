import { Form, Upload } from "antd";

export function FileUpload({ name = 'file', rules
    = [{ required: true, message: 'Vui lòng tải lên tệp' }]
    , ...props }) {
    return <Form.Item name={name} rules={rules}>
        <Upload
            beforeUpload={() => false}
            maxCount={1}
            {...props}
        >
            
        </Upload>
    </Form.Item>
}