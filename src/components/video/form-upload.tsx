/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { PureComponent, createRef } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  message,
  Progress,
  Switch,
  DatePicker,
  Row,
  Col
} from 'antd';
import { IVideoUpdate, IVideoCreate, IUser } from 'src/interfaces';
import { CameraOutlined } from '@ant-design/icons';
import { performerService } from '@services/index';
import moment from 'moment';
import './video.less';

interface IProps {
  user?: IUser;
  video?: IVideoUpdate;
  submit?: Function;
  beforeUpload?: Function;
  uploading?: boolean;
  uploadPercentage?: number;
}

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
};

const { Option } = Select;

const validateMessages = {
  required: 'This field is required!'
};

export class FormUploadVideo extends PureComponent<IProps> {
  state = {
    previewThumbnail: null,
    previewVideo: null,
    // participantIds: [],
    isSale: false,
    isSchedule: false,
    scheduledAt: moment(),
    performers: []
  };

  formRef: any;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    this.getPerformers();
    const { video } = this.props;
    const { previewVideo } = this.state;
    if (video) {
      this.setState(
        {
          previewThumbnail: video.thumbnail ? video.thumbnail : null,
          previewVideo: video.video && video.video.url ? video.video.url : null,
          isSale: video.isSaleVideo,
          isSchedule: video.isSchedule,
          scheduledAt: video.scheduledAt ? moment(video.scheduledAt) : moment()
        },
        () => {
          if (previewVideo) {
            const videoEl = document.getElementById(
              'video'
            ) as HTMLVideoElement;
            videoEl.setAttribute('src', previewVideo);
          }
        }
      );
    }
  }

  onSwitch(field: string, checked: boolean) {
    if (field === 'saleVideo') {
      this.setState({
        isSale: checked
      });
    }
    if (field === 'scheduling') {
      this.setState({
        isSchedule: checked
      });
    }
  }

  onSchedule(val: any) {
    this.setState({
      scheduledAt: val
    });
  }

  async getPerformers() {
    const resp = await (
      await performerService.search({ status: 'active', limit: 999 })
    ).data;
    this.setState({ performers: resp.data });
  }

  beforeUpload(file: File, field: string) {
    const { beforeUpload: beforeUploadHandler } = this.props;
    const reader = new FileReader();
    reader.addEventListener('load', () =>
      this.setState(
        field === 'thumbnail'
          ? {
              previewThumbnail: reader.result
            }
          : {
              previewVideo: reader.result
            },
        () => {
          if (field === 'video') {
            const video = document.getElementById('video') as HTMLVideoElement;
            video.setAttribute('src', reader.result.toString());
          }
        }
      )
    );
    reader.readAsDataURL(file);
    beforeUploadHandler(file, field);
    return false;
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const { video, submit, uploading, uploadPercentage, user } = this.props;
    const {
      previewThumbnail,
      previewVideo,
      performers,
      isSale,
      isSchedule,
      scheduledAt
    } = this.state;
    const haveVideo = !!video;
    return (
      <Form
        {...layout}
        onFinish={(values: IVideoUpdate) => {
          if (values.isSchedule) {
            // eslint-disable-next-line no-param-reassign
            values.scheduledAt = scheduledAt;
          }
          // if (!values.isSaleVideo) {
          //   values.price = 0;
          // }
          return submit && submit(values);
        }}
        onFinishFailed={() =>
          message.error('Please complete the required fields')
        }
        name="form-upload"
        ref={this.formRef}
        validateMessages={validateMessages}
        initialValues={
          video ||
          ({
            title: '',
            price: 1,
            description: '',
            tags: ['tag'],
            isSaleVideo: isSale,
            participantIds: [user._id],
            isSchedule,
            status: 'active'
          } as IVideoCreate)
        }
        className="account-form"
      >
        <Row>
          <Col md={12} xs={24}>
            <Form.Item
              label="Title"
              labelCol={{ span: 24 }}
              name="title"
              rules={[
                { required: true, message: 'Please input title of video!' }
              ]}
            >
              <Input placeholder="Enter video title" />
            </Form.Item>
            <Form.Item label="Tag" labelCol={{ span: 24 }} name="tags">
              <Select
                mode="tags"
                style={{ width: '100%' }}
                size="middle"
                showArrow={false}
                defaultActiveFirstOption={false}
                placeholder="Add Tags"
              />
            </Form.Item>
            <Form.Item
              label="Participants"
              labelCol={{ span: 24 }}
              name="participantIds"
            >
              <Select
                mode="tags"
                style={{ width: '100%' }}
                size="middle"
                showArrow={false}
                defaultActiveFirstOption={false}
                placeholder="Add Partitipants"
              >
                {performers &&
                  performers.length > 0 &&
                  performers.map((p) => (
                    <Option key={p._id} value={p._id}>
                      {p.name}/ {p.username}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="isSaleVideo"
              label="Is Sale?"
              labelCol={{ span: 24 }}
            >
              <Switch
                checked={isSale}
                onChange={this.onSwitch.bind(this, 'saleVideo')}
              />
            </Form.Item>
            {isSale && (
              <Form.Item name="price" label="Price $" labelCol={{ span: 24 }}>
                <InputNumber min={1} />
              </Form.Item>
            )}
            <Form.Item
              name="isSchedule"
              label="Scheduling?"
              labelCol={{ span: 24 }}
            >
              <Switch
                checked={isSchedule}
                onChange={this.onSwitch.bind(this, 'scheduling')}
              />
            </Form.Item>
            {isSchedule && (
              <Form.Item label="Schedule at">
                <DatePicker
                  disabledDate={(currentDate) =>
                    currentDate && currentDate < moment().endOf('day')
                  }
                  defaultValue={scheduledAt}
                  onChange={this.onSchedule.bind(this)}
                />
              </Form.Item>
            )}
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              name="description"
              label="Description"
              labelCol={{ span: 24 }}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <>
              {(!haveVideo || (haveVideo && video.thumbnail)) && (
                <div key="thumbnail" className="ant-form-item">
                  <label>Thumbnail</label>
                  <Upload
                    listType="picture-card"
                    className="avatar-uploader"
                    accept="image/*"
                    multiple={false}
                    showUploadList={false}
                    disabled={uploading || haveVideo}
                    beforeUpload={(file) =>
                      this.beforeUpload(file, 'thumbnail')
                    }
                  >
                    {previewThumbnail ? (
                      <img
                        src={previewThumbnail}
                        alt="file"
                        style={{ width: '100px' }}
                      />
                    ) : null}
                    {/* <div style={{ clear: 'both' }}></div>
                  {!haveVideo && (
                    <Button>
                      <UploadOutlined /> Select File
                    </Button>
                  )} */}
                    <CameraOutlined />
                  </Upload>
                </div>
              )}
              <div key="video" className="ant-form-item">
                <label>Video</label>
                <Upload
                  listType="picture-card"
                  className="avatar-uploader"
                  accept="video/*"
                  multiple={false}
                  showUploadList={false}
                  disabled={uploading || haveVideo}
                  beforeUpload={(file) => this.beforeUpload(file, 'video')}
                >
                  {previewVideo ? (
                    <video controls id="video" style={{ width: '250px' }} />
                  ) : (
                    <CameraOutlined />
                  )}
                </Upload>
                {uploadPercentage ? (
                  <Progress percent={Math.round(uploadPercentage)} />
                ) : null}
              </div>
            </>
            <Form.Item
              name="status"
              label="Status"
              labelCol={{ span: 24 }}
              rules={[{ required: true, message: 'Please select status!' }]}
            >
              <Select>
                <Select.Option key="active" value="active">
                  Active
                </Select.Option>
                <Select.Option key="inactive" value="inactive">
                  Inactive
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button className="primary" htmlType="submit" loading={uploading}>
            {haveVideo ? 'Update' : 'Upload'}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
