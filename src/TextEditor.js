import React, { useCallback, useEffect, useState } from 'react'
import Quill from "quill"
import "quill/dist/quill.snow.css"
import{ io }from "socket.io-client"
import { useParams } from 'react-router-dom'

const SAVE_INTERVALL_MS = 2000
const TOOLBAR_OPTIONS = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction
    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['clean']                                         // remove formatting button
]

export default function TextEditor() {
    const [socket, setSocket] = useState()//
    const [quill, setQuill] = useState()

    const { id: documentId } = useParams()//recup de l'id du doc

    useEffect(() => {
        const s = io("http://localhost:3001")//la fonction io return un socket
        setSocket(s)
        
        return () => {
            s.disconnect()
        }
    }, [])

    useEffect(() => {
        if (socket == null || quill == null) return//si socket ou quill =>null on n'execute pas ce code

        socket.once('load-document', document => {
            quill.setContents(document)
            quill.enable()
        })

        socket.emit('get-document', documentId)
    }, [socket, quill, documentId])

    //useEffect pour recevoir les éléments
    useEffect(() => { 
        if (socket == null || quill == null) return //la premier fois que le code sera executer les s et q seront non undefineou null
        const handler =  (delta) => {
            quill.updateContents(delta)
        }
        socket.on('receive-changes', handler)

        return () => {
            socket.off('receive-changes', handler)
            }
        }, [socket, quill])

    //useEffect pour detecter les changements quand quill change
    useEffect(() => { 
        if (socket == null || quill == null) return //la premiere fois que le code sera executer les s et q seront non undefineou null
        const handler =  (delta, oldDelta, source) => {
            if (source !== 'user') return // on veut juste capter les changements fait par le user
            socket.emit("send-changes", delta)
        }
        quill.on('text-change', handler)

        return () => {
            quill.off('text-change', handler)
            }
        }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) return

        setInterval(() => {
            socket.emit('save-document', quill.getContents())
        }, SAVE_INTERVALL_MS)
        return () => {
            clearInterval()
        }
    },[socket, quill])
    
    
    const wrapperRef = useCallback((wrapper) => {   
        if (wrapper == null) return
        wrapper.innerHTML = ""
        // on dit que l'on a une callback et on la passe à l'élément ayant 
        //la ref donc l'élément aura le temps d'être editer et finde l'erreur object is not extensible
        const editor = document.createElement('div')//on wrapp l'editeur de texte dans une div 
        wrapper.append(editor)
        const q = new Quill(editor, { theme: "snow", modules: {toolbar: TOOLBAR_OPTIONS}})//ici l'editeur sera contenu dans la div editor
        q.disable()
        q.setText('Chargement...')
        setQuill(q)
        return () => {
            wrapperRef.innerHTML = ''
        }
    }, [])
    return (
        <div className="container" ref={wrapperRef}></div>
    )
}
