import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, DatePicker, Form, Input, InputNumber, Rate, Upload, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuth";
import { useHotelStore } from "../../store/useHotelStore";
import { Hotel } from "../../types/hotel";

const HotelForm = () => {
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const { addHotel, getMerchantHotels, updateHotel, refreshHotels, loading } = useHotelStore();
  const myHotels = getMerchantHotels(user!.id);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    void refreshHotels();
  }, [refreshHotels]);

  const onFinish = async (values: any) => {
    const hotelData: Omit<Hotel, "id" | "createdAt" | "status"> = {
      merchantId: user!.id,
      nameZh: values.nameZh,
      nameEn: values.nameEn,
      address: values.address,
      starLevel: values.starLevel,
      roomTypes: values.roomTypes.map((r: any) => ({ id: `${Date.now()}-${Math.random()}`, ...r })),
      openTime: values.openTime.format("YYYY-MM-DD"),
      images: values.images?.fileList?.map((f: any) => f.thumbUrl || f.response?.url) || [],
      nearby: values.nearby,
      discounts: values.discounts
    };

    if (editingId) {
      await updateHotel(editingId, { ...hotelData, status: "auditing" });
      message.success("修改成功，已重新进入审核");
    } else {
      await addHotel({ ...hotelData, status: "auditing" });
      message.success("提交成功，等待管理员审核");
    }
    form.resetFields();
    setEditingId(null);
  };

  const editHotel = (hotel: Hotel) => {
    form.setFieldsValue({
      ...hotel,
      openTime: dayjs(hotel.openTime),
      roomTypes: hotel.roomTypes
    });
    setEditingId(hotel.id);
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title={editingId ? "编辑酒店" : "新增酒店"}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="酒店中文名" name="nameZh" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="酒店英文名" name="nameEn">
            <Input />
          </Form.Item>
          <Form.Item label="地址" name="address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="星级" name="starLevel" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>
          <Form.Item label="开业时间" name="openTime" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.List name="roomTypes">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Card key={field.key} style={{ marginBottom: 16 }}>
                    <Form.Item {...field} label="房型名称" name={[field.name, "name"]} rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item {...field} label="价格" name={[field.name, "price"]} rules={[{ required: true }]}>
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item {...field} label="折扣(可选)" name={[field.name, "discount"]}>
                      <InputNumber max={1} min={0.1} step={0.1} style={{ width: "100%" }} />
                    </Form.Item>
                    <Button danger onClick={() => remove(field.name)} type="link">
                      删除房型
                    </Button>
                  </Card>
                ))}
                <Button block icon={<PlusOutlined />} onClick={() => add()} type="dashed">
                  添加房型
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item label="附近景点/交通" name="nearby">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="优惠信息" name="discounts">
            <Input.TextArea placeholder="如：节日 8 折" />
          </Form.Item>
          <Form.Item label="酒店图片" name="images">
            <Upload
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const url = event.target?.result as string;
                  form.setFieldValue("images", {
                    fileList: [...(form.getFieldValue("images")?.fileList || []), { thumbUrl: url }]
                  });
                };
                reader.readAsDataURL(file);
                return false;
              }}
              listType="picture-card"
            >
              <div>+ 上传</div>
            </Upload>
          </Form.Item>

          <Button block htmlType="submit" loading={loading} size="large" type="primary">
            {editingId ? "保存修改" : "提交审核"}
          </Button>
        </Form>
      </Card>

      <Card style={{ marginTop: 24 }} title="我的酒店">
        {myHotels.map((hotel) => (
          <Card key={hotel.id} style={{ marginBottom: 16 }}>
            <h3>{hotel.nameZh}</h3>
            <p>状态：{hotel.status === "auditing" ? "审核中" : hotel.status}</p>
            <Button onClick={() => editHotel(hotel)}>编辑</Button>
          </Card>
        ))}
      </Card>
    </div>
  );
};

export default HotelForm;
