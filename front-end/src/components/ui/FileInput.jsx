import { Button, Tooltip } from "antd"
import React, { useRef } from "react"
import { MdUpload } from "react-icons/md"

export default ({ children, className, ...props }) => {
  const ref = useRef()
  return <div>
    <input type="file" multiple={true} hidden ref={ref} {...props}></input>
    <Tooltip title="Upload file">
      <Button type="text" icon={<MdUpload />} onClick={() => ref.current.click()}>
      </Button>
    </Tooltip>
  </div>
}