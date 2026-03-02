import { Button, Descriptions, Divider, Image, Input, Modal, Table, Tag, message } from "antd";
import { useEffect, useState } from "react";
import { useHotelStore } from "../../store/useHotelStore";
import { Hotel, HotelStatus } from "../../types/hotel";

const HotelListAdmin = () => {
  const { getAllHotels, updateHotel, refreshHotels, loading } = useHotelStore();
  const hotels = getAllHotels();
  const [rejectModal, setRejectModal] = useState<Hotel | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    void refreshHotels();
  }, [refreshHotels]);

  const handleStatus = async (id: string, status: HotelStatus, reason?: string) => {
    await updateHotel(id, { status, ...(reason && { rejectReason: reason }) });
    message.success(`操作成功 → ${status}`);
    setRejectModal(null);
    setRejectReason("");
  };

  const showHotelDetail = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setDetailVisible(true);
  };

  const columns = [
    { title: "酒店名", dataIndex: "nameZh", key: "nameZh" },
    { title: "商户ID", dataIndex: "merchantId", key: "merchantId" },
    { title: "星级", dataIndex: "starLevel", key: "starLevel" },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: HotelStatus) => (
        <Tag color={status === "published" ? "green" : status === "rejected" ? "red" : "orange"}>{status}</Tag>
      )
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: Hotel) => (
        <>
          {record.status === "auditing" ? (
            <>
              <Button onClick={() => void handleStatus(record.id, "approved")} type="link">
                通过
              </Button>
              <Button danger onClick={() => setRejectModal(record)} type="link">
                拒绝
              </Button>
            </>
          ) : null}
          {record.status === "approved" ? (
            <Button onClick={() => void handleStatus(record.id, "published")} type="link">
              发布
            </Button>
          ) : null}
          {record.status === "published" || record.status === "approved" ? (
            <Button danger onClick={() => void handleStatus(record.id, "offline")} type="link">
              下线
            </Button>
          ) : null}
          {record.status === "rejected" ? <span>原因：{record.rejectReason}</span> : null}
          {record.status === "offline" ? (
            <Button onClick={() => void handleStatus(record.id, "approved")} type="link">
              恢复
            </Button>
          ) : null}
          <Button onClick={() => showHotelDetail(record)} type="link">
            查看详情
          </Button>
        </>
      )
    }
  ];

  return (
    <div>
      <h2>酒店审核 / 发布 / 下线</h2>
      <Table columns={columns} dataSource={hotels} loading={loading} rowKey="id" />

      <Modal
        onCancel={() => setRejectModal(null)}
        onOk={() => rejectModal && void handleStatus(rejectModal.id, "rejected", rejectReason)}
        open={!!rejectModal}
        title="拒绝原因"
      >
        <Input.TextArea onChange={(event) => setRejectReason(event.target.value)} placeholder="请输入拒绝原因" rows={4} value={rejectReason} />
      </Modal>

      <Modal
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>
        ]}
        onCancel={() => setDetailVisible(false)}
        open={detailVisible}
        title={selectedHotel ? `${selectedHotel.nameZh} (${selectedHotel.nameEn || "无英文名"}) - 详细信息` : ""}
        width={1000}
      >
        {selectedHotel ? (
          <div style={{ padding: "16px 0" }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="酒店中文名">{selectedHotel.nameZh}</Descriptions.Item>
              <Descriptions.Item label="酒店英文名">{selectedHotel.nameEn || "-"}</Descriptions.Item>
              <Descriptions.Item label="地址">{selectedHotel.address}</Descriptions.Item>
              <Descriptions.Item label="星级">{selectedHotel.starLevel} 星</Descriptions.Item>
              <Descriptions.Item label="开业时间">{selectedHotel.openTime}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedHotel.status === "published" ? "green" : selectedHotel.status === "rejected" ? "red" : "orange"}>
                  {selectedHotel.status}
                </Tag>
              </Descriptions.Item>
              {selectedHotel.rejectReason ? (
                <Descriptions.Item label="拒绝原因" span={2}>
                  {selectedHotel.rejectReason}
                </Descriptions.Item>
              ) : null}
            </Descriptions>

            <Divider>房型信息</Divider>
            <Table
              columns={[
                { title: "房型名称", dataIndex: "name" },
                { title: "价格(元)", dataIndex: "price" },
                { title: "折扣", dataIndex: "discount", render: (value?: number) => (value ? `${(value * 100).toFixed(0)}折` : "-") }
              ]}
              dataSource={selectedHotel.roomTypes}
              pagination={false}
              rowKey="id"
            />

            <Divider>其他信息</Divider>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="附近景点/交通">{selectedHotel.nearby || "-"}</Descriptions.Item>
              <Descriptions.Item label="优惠信息">{selectedHotel.discounts || "-"}</Descriptions.Item>
            </Descriptions>

            {selectedHotel.images?.length ? (
              <>
                <Divider>酒店图片</Divider>
                <Image.PreviewGroup>
                  {selectedHotel.images.map((img, index) => (
                    <Image key={index} src={img} style={{ marginBottom: 8, marginRight: 8 }} width={200} />
                  ))}
                </Image.PreviewGroup>
              </>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default HotelListAdmin;
