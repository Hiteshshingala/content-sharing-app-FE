import React, { PureComponent } from 'react';
import Head from 'next/head';
import { message, Layout, Button, Row, Col } from 'antd';
import { videoService } from '@services/video.service';
import { SearchFilter } from '@components/common/base/search-filter';
import { TableListVideo } from '@components/video/table-list';
import Page from '@components/common/layout/page';
import Link from 'next/link';
import { connect } from 'react-redux';
import { UploadOutlined } from '@ant-design/icons';
import { IUIConfig } from '../../src/interfaces';

const { Content } = Layout;

interface IProps {
  ui: IUIConfig;
}

class Videos extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 10,
    filter: {} as any,
    sortBy: 'createdAt',
    sort: 'desc'
  };

  componentDidMount() {
    this.search();
  }

  handleTableChange = (pagination, filters, sorter) => {
    const { pagination: paginationVal } = this.state;
    const pager = { ...paginationVal };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
      sortBy: sorter.field || '',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : ''
    });
    this.search(pager.current);
  };

  async search(page = 1) {
    try {
      const { filter, limit, sort, sortBy, pagination } = this.state;
      await this.setState({ searching: true });
      const resp = await videoService.search({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sort,
        sortBy
      });
      await this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total,
          pageSize: limit
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      await this.setState({ searching: false });
    }
  }

  async handleFilter(filter) {
    await this.setState({ filter });
    this.search();
  }

  async deleteVideo(id: string) {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return false;
    }
    try {
      const { pagination } = this.state;
      await videoService.delete(id);
      await this.search(pagination.current);
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
    return undefined;
  }

  render() {
    const { list, searching, pagination } = this.state;
    const statuses = [
      {
        key: '',
        text: 'Status'
      },
      {
        key: 'draft',
        text: 'Draft'
      },
      {
        key: 'active',
        text: 'Active'
      },
      {
        key: 'inactive',
        text: 'Inactive'
      }
    ];

    return (
      <>
        <Head>
          <title>xFans | Video Managment</title>
        </Head>
        <Content>
          <div className="main-container">
            {/* <BreadcrumbComponent
              breadcrumbs={[
                { title: 'Video managent', href: '/video-manager' }
              ]}
            /> */}

            <Page>
              <div className="page-heading">
                <span>Video Managment</span>
              </div>
              <div>
                <Row>
                  <Col xl={16}>
                    <SearchFilter
                      statuses={statuses}
                      onSubmit={this.handleFilter.bind(this)}
                    />
                  </Col>
                  <Col xl={8} style={{ display: 'flex', alignItems: 'center' }}>
                    <Button className="primary">
                      <Link href="/video-manager/upload">
                        <a>
                          {' '}
                          <UploadOutlined /> Upload new
                        </a>
                      </Link>
                    </Button>
                    &nbsp;
                    <Button className="secondary">
                      <Link href="/video-manager/bulk-upload">
                        <a>
                          <UploadOutlined /> Bulk upload
                        </a>
                      </Link>
                    </Button>
                  </Col>
                </Row>
              </div>

              <div style={{ marginBottom: '20px' }} />
              <div className="table-responsive">
                <TableListVideo
                  dataSource={list}
                  rowKey="_id"
                  loading={searching}
                  pagination={pagination}
                  onChange={this.handleTableChange.bind(this)}
                  onDelete={this.deleteVideo.bind(this)}
                />
              </div>
            </Page>
          </div>
        </Content>
      </>
    );
  }
}
const mapStates = (state) => ({
  ui: state.ui
});
export default connect(mapStates)(Videos);
