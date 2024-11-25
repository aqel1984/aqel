// Inspired by react-hot-toast library
import * as React from "react"
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST_WITH_ID: "DISMISS_TOAST_WITH_ID",
  DISMISS_ALL_TOASTS: "DISMISS_ALL_TOASTS",
  REMOVE_TOAST_WITH_ID: "REMOVE_TOAST_WITH_ID",
  REMOVE_ALL_TOASTS: "REMOVE_ALL_TOASTS",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST_WITH_ID"]
      toastId: string
    }
  | {
      type: ActionType["DISMISS_ALL_TOASTS"]
    }
  | {
      type: ActionType["REMOVE_TOAST_WITH_ID"]
      toastId: string
    }
  | {
      type: ActionType["REMOVE_ALL_TOASTS"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST_WITH_ID",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST_WITH_ID": {
      const toastId = action.toastId

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      addToRemoveQueue(toastId)

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "DISMISS_ALL_TOASTS": {
      state.toasts.forEach((toast) => {
        addToRemoveQueue(toast.id)
      })

      return {
        ...state,
        toasts: state.toasts.map((t) => ({ ...t, open: false })),
      }
    }
    case "REMOVE_TOAST_WITH_ID": {
      const toastId = action.toastId
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      }
    }
    case "REMOVE_ALL_TOASTS": {
      return {
        ...state,
        toasts: [],
      }
    }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST_WITH_ID", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        dispatch({ type: "DISMISS_TOAST_WITH_ID", toastId })
      } else {
        dispatch({ type: "DISMISS_ALL_TOASTS" })
      }
    },
  }
}

export { useToast, toast }
