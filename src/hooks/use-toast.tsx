import * as React from "react"

import {
  Toast,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 20
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = {
  id: string
  title?: string
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive"
  open: boolean
  onOpenChange?: (open: boolean) => void
  duration?: number
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
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
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        if (toastTimeouts.has(toastId)) {
          clearTimeout(toastTimeouts.get(toastId))
          toastTimeouts.delete(toastId)
        }
      } else {
        for (const [id, timeout] of toastTimeouts.entries()) {
          clearTimeout(timeout)
          toastTimeouts.delete(id)
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

export interface ToastOptions {
  title?: string
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive"
  duration?: number
}

interface ToastContextValue {
  toasts: ToasterToast[]
  toast: (options: ToastOptions) => string
  dismiss: (toastId?: string) => void
  update: (id: string, options: ToastOptions) => void
}

const ToastContext = React.createContext<ToastContextValue>({
  toasts: [],
  toast: () => "",
  dismiss: () => {},
  update: () => {},
})

export function ToastProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const [state, dispatch] = React.useReducer(reducer, {
    toasts: [],
  })

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (
        toast.open &&
        !toastTimeouts.has(toast.id) &&
        toast.duration !== Infinity
      ) {
        const timeout = setTimeout(() => {
          dispatch({
            type: actionTypes.DISMISS_TOAST,
            toastId: toast.id,
          })

          setTimeout(() => {
            dispatch({
              type: actionTypes.REMOVE_TOAST,
              toastId: toast.id,
            })
          }, TOAST_REMOVE_DELAY)
        }, toast.duration || 5000)

        toastTimeouts.set(toast.id, timeout)
      }
    })

    return () => {
      for (const [, timeout] of toastTimeouts.entries()) {
        clearTimeout(timeout)
      }
    }
  }, [state.toasts])

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = genId()

      const newToast: ToasterToast = {
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) {
            dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })
            setTimeout(() => {
              dispatch({ type: actionTypes.REMOVE_TOAST, toastId: id })
            }, TOAST_REMOVE_DELAY)
          }
        },
        ...options,
      }

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: newToast,
      })

      return id
    },
    [dispatch]
  )

  const update = React.useCallback(
    (id: string, options: ToastOptions) => {
      dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: { id, ...options },
      })
    },
    [dispatch]
  )

  const dismiss = React.useCallback(
    (toastId?: string) => {
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId })
    },
    [dispatch]
  )

  return (
    <ToastContext.Provider
      value={{
        toasts: state.toasts,
        toast,
        dismiss,
        update,
      }}
    >
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

export const toast = (options: ToastOptions) => {
  const { toast } = useToast()
  return toast(options)
}
