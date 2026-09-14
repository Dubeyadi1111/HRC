import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/client'

export const fetchHcps = createAsyncThunk('hcps/fetchAll', async () => {
  const res = await api.get('/hcps/')
  return res.data
})

export const createHcp = createAsyncThunk('hcps/create', async (payload) => {
  const res = await api.post('/hcps/', payload)
  return res.data
})

const hcpSlice = createSlice({
  name: 'hcps',
  initialState: {
    items: [],
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHcps.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchHcps.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchHcps.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(createHcp.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
  },
})

export default hcpSlice.reducer
