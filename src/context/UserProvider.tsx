import { useEffect, useReducer, useState } from 'react'
import { userReducer } from './userReducer'
import { UserContext } from './UserContext'
import apiMusic from '../config/apiMusic'
import { IMusic, Item, Tracks } from '../pages/models'
import { reloadToken } from '../hooks/useApi'

const INITIAL_STATE = {
    name: '',
    password: '',
    email: '',
    favTracks: JSON.parse(localStorage.getItem('favTracks') ?? '[]'),
    isPremium: false,
}

interface props {
    children: JSX.Element | JSX.Element[]
}

export const UserProvider = ({ children }: props) => {
    const [userState, dispatch] = useReducer(userReducer, INITIAL_STATE)
    const [tracks, setUseTracks] = useState<Tracks | void>()
    const [selected, setSelected] = useState<boolean>(false)
    const [listTracks, setListTrack] = useState(tracks)

    useEffect(() => {
        reloadToken()
    }, [])

    const addTrack = (track: Item) => {
        dispatch({
            payload: track,
            type: 'addTrack',
        })
    }

    const removeTrack = (id: string) => {
        dispatch({
            payload: id,
            type: 'removeTrack',
        })
    }

    const changeProgramUser = (isPremium: boolean) => {
        dispatch({
            payload: isPremium,
            type: 'changePremiumUser',
        })
    }

    const searchSong = async (word: string): Promise<IMusic> => {
        const response = await apiMusic({
            method: 'GET',
            url: `/search?q=${word}&type=track`,
        })
            .then(({ data }) => {
                return data
            })
            .catch((e) => {
                console.log('Error :(', e)
            })
        return response
    }

    const _toggleFav = (track: Item) => {
        setSelected(!selected)
        if (track.selected) {
            track.selected = false
            removeTrack(track.id)
        } else {
            addTrack(track)
            track.selected = true
        }
        if (listTracks) {
            const foundIndex = listTracks.items.findIndex((x) => x.id == track.id)
            listTracks.items[foundIndex] = track
            setListTrack(listTracks)
        }
    }

    return (
        <UserContext.Provider
            value={{
                userState,
                searchSong,
                addTrack,
                removeTrack,
                _toggleFav,
                setUseTracks,
                tracks,
                selected,
                changeProgramUser,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}
