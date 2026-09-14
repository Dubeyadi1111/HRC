import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/client'

export const fetchInteractions = createAsyncThunk(
  'interactions/fetchAll',
  async (hcpId) => {
    const res = await api.get('/interactions/', {
      params: hcpId ? { hcp_id: hcpId } : {},
    })
    return res.data
  }
)

export const createInteraction = createAsyncThunk(
  'interactions/create',
  async (payload) => {
    const res = await api.post('/interactions/', payload)
    return res.data
  }
)

export const updateInteraction = createAsyncThunk(
  'interactions/update',
  async ({ id, changes }) => {
    const res = await api.patch(`/interactions/${id}`, changes)
    return res.data
  }
)

const interactionSlice = createSlice({
  name: 'interactions',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    lastSubmitStatus: null, // 'success' | 'error' | null
  },
  reducers: {
    clearSubmitStatus(state) {
      state.lastSubmitStatus = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(createInteraction.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.lastSubmitStatus = 'success'
      })
      .addCase(createInteraction.rejected, (state) => {
        state.lastSubmitStatus = 'error'
      })
      .addCase(updateInteraction.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
  },
})

export const { clearSubmitStatus } = interactionSlice.actions
export default interactionSlice.reducer
