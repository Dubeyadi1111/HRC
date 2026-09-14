import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/client'

export const sendChatMessage = createAsyncThunk(
  'chat/send',
  async ({ message, sessionId }, thunkAPI) => {
    try {
      const res = await api.post('/chat/', { message, session_id: sessionId })
      return res.data
    } catch (error) {
      const detail = error.response?.data?.detail || error.message || 'Unknown error'
      return thunkAPI.rejectWithValue(detail)
    }
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    sessionId: 'rep-session-1',
    messages: [
      {
        role: 'agent',
        content:
          "Hi! Tell me about a visit — e.g. \"Met Dr. Mehta at City Hospital today, she was excited about the new inhaler and wants a follow-up in two weeks.\"",
        toolCalls: [],
      },
    ],
    status: 'idle',
    error: null,
  },
  reducers: {
    addUserMessage(state, action) {
      state.messages.push({ role: 'user', content: action.payload, toolCalls: [] })
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.messages.push({
          role: 'agent',
          content: action.payload.reply,
          toolCalls: action.payload.tool_calls || [],
        })
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
        state.messages.push({
          role: 'agent',
          content: state.error || 'Sorry, something went wrong reaching the agent. Please try again.',
          toolCalls: [],
        })
      })
  },
})

export const { addUserMessage } = chatSlice.actions
export default chatSlice.reducer
