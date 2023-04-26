import React, { PureComponent } from 'react';
import { Select } from 'antd';
import { sortBy } from 'lodash';
import { performerService } from '@services/performer.service';

const { Option } = Select;

interface IProps {
  placeholder?: string;
  style?: Record<string, string>;
  defaultValue?: any;
  onSelect: Function;
  disabled?: boolean;
}

export class SelectPerformerDropdown extends PureComponent<IProps> {
  _initalData = [];

  state = {
    data: [] as any,
    value: undefined
  };

  componentDidMount() {
    this.loadPerformers();
  }

  handleSearch = (value) => {
    const q = value.toLowerCase();
    const filtered = this._initalData.filter(
      (p) => p.username.includes(q) || (p.name || '').toLowerCase().includes(q)
    );
    this.setState({ data: filtered });
  };

  async loadPerformers() {
    // TODO - should check for better option?
    const resp = await performerService.search({ limit: 1000 });
    this._initalData = sortBy(resp.data.data, (i) => i.username);
    this.setState({
      data: [...this._initalData]
    });
  }

  render() {
    const { disabled, placeholder, style, onSelect, defaultValue } = this.props;
    const { value, data } = this.state;
    return (
      <Select
        showSearch
        value={value}
        placeholder={placeholder}
        style={style}
        defaultActiveFirstOption={false}
        showArrow
        filterOption={false}
        onSearch={this.handleSearch}
        onChange={onSelect.bind(this)}
        notFoundContent={null}
        defaultValue={defaultValue}
        disabled={disabled}
        allowClear
      >
        {data.map((p) => (
          <Option key={p._id} value={p._id}>
            <span>
              <strong>{p.username}</strong> /<span>{p.name}</span>
            </span>
          </Option>
        ))}
      </Select>
    );
  }
}
