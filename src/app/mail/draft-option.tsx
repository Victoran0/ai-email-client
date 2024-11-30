'use client'
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'


type Props = {
    open: boolean
    setOpen: (value: boolean) => void
    handleSaveDraft: () => void
    handleDeleteDraft: () => void
}

const DraftOption = ({open, setOpen, handleSaveDraft, handleDeleteDraft}: Props) => {

  return (
    <Dialog open={open} onOpenChange={setOpen} >
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Do you want to save your Draft?</DialogTitle>
            <div className="h-2"></div>
            <div className="h-2"></div>
            <div className="flex items-center gap-2">
                <Button 
                    className='hover:bg-gray-200 hover:text-black'
                    onClick={() => {
                        setOpen(false);
                        handleDeleteDraft()
                    }}  
                >
                    Save draft
                </Button>
                <Button 
                    className='bg-gray-200 text-black hover:text-white'
                    onClick={() => {
                        setOpen(false);
                        handleSaveDraft();
                    }}  
                >
                    Discard
                </Button>
            </div>
            </DialogHeader>
        </DialogContent>
    </Dialog>

  )
}

export default DraftOption