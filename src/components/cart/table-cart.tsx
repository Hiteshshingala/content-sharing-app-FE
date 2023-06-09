import React, { PureComponent } from 'react';
import { Table, Button, Tag, InputNumber, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { ImageProduct } from '@components/product/image-product';
import { IProduct } from 'src/interfaces';

interface IProps {
  dataSource: IProduct[];
  rowKey: string;
  loading?: boolean;
  pagination?: {};
  onChange?: Function;
  deleteItem?: Function;
  onChangeQuantity?: Function;
  onRemoveItemCart?: Function;
}

export class TableCart extends PureComponent<IProps> {
  timeout = 0;

  render() {
    const {
      dataSource,
      rowKey,
      loading,
      onRemoveItemCart,
      onChangeQuantity
    } = this.props;
    const changeQuantity = async (item, quantity: any) => {
      if (!quantity) return;
      try {
        if (this.timeout) clearTimeout(this.timeout);
        let remainQuantity = quantity;
        this.timeout = window.setTimeout(async () => {
          if (quantity > item.stock) {
            remainQuantity = item.stock;
            message.error('Quantity must not be larger than quantity in stock');
          }
          onChangeQuantity(item, remainQuantity);
        }, 300);
      } catch (error) {
        message.error('An error occurred, please try again!');
      }
    };
    const columns = [
      {
        title: '',
        dataIndex: 'image',
        render(data, record) {
          return <ImageProduct product={record} />;
        }
      },
      {
        title: 'Name',
        dataIndex: 'name'
      },
      {
        title: 'Price',
        dataIndex: 'price',
        render(price: number) {
          return <span>${price.toFixed(2)}</span>;
        }
      },
      {
        title: 'Type',
        dataIndex: 'type',
        render(type: string) {
          switch (type) {
            case 'physical':
              return <Tag color="#7b5cbd">Physical</Tag>;
            case 'digital':
              return <Tag color="#00dcff">Digital</Tag>;
            default:
              break;
          }
          return <Tag color="">{type}</Tag>;
        }
      },
      {
        title: 'Stock',
        dataIndex: 'stock',
        render(stock: number) {
          return <span>{stock || 'Out of stock'}</span>;
        }
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        render(data, record) {
          return (
            <InputNumber
              value={record.quantity || 1}
              onChange={(event) => changeQuantity(record, event)}
              type="number"
              min={1}
            />
          );
        }
      },
      {
        title: 'Provisionally charged',
        dataIndex: 'quantity',
        render(data, record) {
          return (
            <span>${((record.quantity || 1) * record.price).toFixed(2)}</span>
          );
        }
      },
      {
        title: 'Action',
        dataIndex: '',
        render(data, record) {
          return (
            <Button className="danger" onClick={() => onRemoveItemCart(record)}>
              <DeleteOutlined />
            </Button>
          );
        }
      }
    ];
    return (
      <div className="table-responsive table-cart">
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey={rowKey}
          loading={loading}
          pagination={false}
        />
      </div>
    );
  }
}
