import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Button } from 'antd'; 
import axios from 'axios'; 
import { useNavigate, useLocation } from 'react-router-dom';

const App = () => {
  // State variables
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
  });
  const [filters, setFilters] = useState({
    tags: [],
    searchText: '',
  });
  const [allTags, setAllTags] = useState([]);

  // Hooks for navigation and location
  const navigate = useNavigate();
  const location = useLocation();

  // Function to fetch data 
  const getData = async () => {
    setLoading(true);
    try {
      const { search } = location;
      const queryParams = new URLSearchParams(search);
      const currentPage = parseInt(queryParams.get('page') || 1);
      const pageSize = parseInt(queryParams.get('pageSize') || 10);
      const tags = queryParams.getAll('tags');
      const searchText = queryParams.get('searchText') || '';

      const response = await axios.get(`https://dummyjson.com/posts`);
      const fetchedPosts = response.data.posts;
      setPosts(fetchedPosts);
      setPagination({ ...pagination, currentPage, pageSize });
      setFilters({ tags, searchText });

      const uniqueTags = Array.from(new Set(fetchedPosts.flatMap(post => post.tags)));
      setAllTags(uniqueTags);
    } catch (error) {
      console.error('Error fetching data:', error); // Log error if data fetching fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [location]);

  const handleTableChange = (pagination, filters) => {
    const newParams = new URLSearchParams({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...filters,
    });
    navigate({ search: newParams.toString() });
  };

  const handleTagChange = (value) => {
    setFilters({ ...filters, tags: value });
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, searchText: e.target.value });
  };

  const clearFilters = () => {
    // Reset filter state to initial values
    setFilters({ tags: [], searchText: '' });
  };

  const filteredPosts = posts.filter((post) => {
    const hasTag = filters.tags.length === 0 || filters.tags.some((tag) => post.tags.includes(tag));
    const searchTextMatch = post.body.toLowerCase().includes(filters.searchText.toLowerCase());
    return hasTag && searchTextMatch;
  });

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Body', dataIndex: 'body', key: 'body' },
  ];

  return (
    <div>
      <Input.Search style={{ marginBottom: 16 }} placeholder="Search posts..." onChange={handleSearchChange} />
      <Select
        mode="multiple"
        style={{ width: 200, marginBottom: 16 }}
        placeholder="Filter by tags"
        onChange={handleTagChange}
        value={filters.tags}
      >
        {allTags.map((tag) => (
          <Select.Option key={tag} value={tag}>
            {tag}
          </Select.Option>
        ))}
      </Select>
      {/* Button to clear all filters */}
      <Button onClick={clearFilters} style={{ marginBottom: 16 }}>
        Clear Filters
      </Button>
      <Table columns={columns} dataSource={filteredPosts} loading={loading} pagination={pagination} onChange={handleTableChange} />
    </div>
  );
};

export default App;
