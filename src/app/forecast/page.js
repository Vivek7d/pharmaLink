"use client"
import React, { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Grid, Box, Card, CardContent, CircularProgress } from '@mui/material';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const Page = () => {
  const [data, setData] = useState([]);
  const [analytics, setAnalytics] = useState({
    mean: null,
    min: null,
    max: null,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);

  // Fetch data from Flask API with pagination
  const fetchData = async () => {
    try {
      setLoading(true);  // Show loading spinner
      const response = await fetch(`http://127.0.0.1:5000/data?page=${page}&page_size=${pageSize}`);
      const result = await response.json();
      setData(result);
      performAnalytics(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);  // Hide loading spinner
    }
  };

  // Perform analytics (mean, min, max of yhat)
  const performAnalytics = (data) => {
    const yhatValues = data.map(item => item.yhat);
    const mean = (yhatValues.reduce((sum, val) => sum + val, 0) / yhatValues.length).toFixed(2);
    const min = Math.min(...yhatValues).toFixed(2);
    const max = Math.max(...yhatValues).toFixed(2);

    setAnalytics({ mean, min, max });
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);  // Re-fetch when page or page size changes

  // Handle pagination change
  const handleNextPage = () => setPage(prev => prev + 1);
  const handlePrevPage = () => setPage(prev => Math.max(prev - 1, 1));

  // Prepare data for the line chart
  const chartData = {
    labels: data.map(item => item.ds),  // Dates
    datasets: [
      {
        label: 'Predicted yhat',
        data: data.map(item => item.yhat),
        fill: true,  // Filling the area under the line
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',  // Light green for the prediction line
        tension: 0.1,
      },
      {
        label: 'Lower Bound (yhat_lower)',
        data: data.map(item => item.yhat_lower),
        borderColor: '#f44336',
        borderDash: [5, 5],  // Dotted line for lower bound
        fill: false,
      },
      {
        label: 'Upper Bound (yhat_upper)',
        data: data.map(item => item.yhat_upper),
        borderColor: '#f44336',
        borderDash: [5, 5],  // Dotted line for upper bound
        fill: false,
      }
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 20,
        }
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `Prediction: ${tooltipItem.raw.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Predicted Value (yhat)',
        },
      },
    },
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f4f6f8' }}>
      <Typography variant="h3" sx={{ textAlign: 'center', marginBottom: 4, fontWeight: 'bold', color: '#333' }}>Analytics Dashboard</Typography>
      
      {/* Loading Spinner */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <CircularProgress size={60} color="primary" />
        </Box>
      )}

      <Grid container spacing={4}>
        {/* Analytics Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#fff', boxShadow: 3, padding: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>Analytics Summary</Typography>
              <Typography variant="body1" sx={{ marginTop: 2 }}>Mean of yhat: <strong>{analytics.mean}</strong></Typography>
              <Typography variant="body1">Min of yhat: <strong>{analytics.min}</strong></Typography>
              <Typography variant="body1">Max of yhat: <strong>{analytics.max}</strong></Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ backgroundColor: '#fff', boxShadow: 3, padding: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }} gutterBottom>yhat Values Over Time</Typography>
              <Line data={chartData} options={options} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Table */}
      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>Data Table</Typography>
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>yhat</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>yhat_lower</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>yhat_upper</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}>
                  <TableCell>{item.ds}</TableCell>
                  <TableCell>{item.yhat.toFixed(2)}</TableCell>
                  <TableCell>{item.yhat_lower.toFixed(2)}</TableCell>
                  <TableCell>{item.yhat_upper.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Pagination */}
      <Box sx={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}>
        <Button onClick={handlePrevPage} disabled={page === 1} variant="contained" sx={{ marginRight: 2, backgroundColor: '#00796b', '&:hover': { backgroundColor: '#004d40' }, borderRadius: 2 }}>
          Previous
        </Button>
        <Typography variant="body1" sx={{ marginRight: 2, alignSelf: 'center', fontWeight: 'bold' }}>
          Page {page}
        </Typography>
        <Button onClick={handleNextPage} variant="contained" sx={{ backgroundColor: '#00796b', '&:hover': { backgroundColor: '#004d40' }, borderRadius: 2 }}>
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default Page;
