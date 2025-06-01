import {Pressable, Text, View, Linking, ActivityIndicator, ScrollView} from "react-native";
import { Input, SearchBar } from 'react-native-elements';

import * as React from 'react';
import {Menu, Provider, TextInput} from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {useEffect, useRef, useState} from "react";
import * as Clipboard from 'expo-clipboard';

import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
console.log('API URL:', apiUrl);

/*const documents: any = [
    {id: 1, title: 'Dossier de Presse', url: 'http://briefcase.fairytalesinyoghourt.fun/d/fr/presskit%7D?inline=1'},
    {id: 2, title: 'Photo',  url: 'http://briefcase.fairytalesinyoghourt.fun/d/fr/figuration-portrait%7D?inline=1'},
    {id: 3, title: 'Photo 2',  url: 'http://briefcase.fairytalesinyoghourt.fun/d/fr/figuration-portrait%7D?inline=1'},
    {id: 4, title: 'Photo 3',  url: 'http://briefcase.fairytalesinyoghourt.fun/d/fr/figuration-portrait%7D?inline=1'},
];*/

type Document = {
    id: number;
    name: string;
    token: string;
    url: string;
    fa_icon_name: string;
    sensible: boolean;
    expo_icon_name: string;
}

export default function Index() {
    const [search, setSearch] = useState<string | null>(null);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
    const [visible, setVisible] = useState<boolean>(false);
    const [menuPosition, setMenuPosition] = useState<{x: number, y: number}>({ x: 0, y: 0 });
    const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
    const docRefs = useRef<{ [key: string]: React.RefObject<View | null> }>({});

    const openMenu = (i: number, event: any) => {
        setCurrentDoc(documents[i]);
        const { locationX, locationY, pageX, pageY } = event.nativeEvent;
        setMenuPosition({ x: pageX, y: pageY });
        setVisible(true);
        return;
    }
    const closeMenu = () => setVisible(false);

    const copyLink = async(url: string) => {
        await Clipboard.setStringAsync(url);
        alert('Lien copié !');
        closeMenu();
    }

    const openLink = async(url: string) => {
        await Linking.openURL(url);
        closeMenu();
    }

    const filterDocuments = async(text: string | null) => {
        const results = (!text || text === '')
            ? documents
            : documents.filter(doc => doc.name.toLowerCase().includes(text.toLowerCase()));
        setFilteredDocuments(results);
    }

    //------

    useEffect(() => {
        const fetchDocuments =  async () => {
            try {
                const resp = await fetch('http://192.168.1.23:8000/api/documents');
                const json = await resp.json();
                const documents = json.map((doc: Document) => {
                    if (doc.fa_icon_name === 'file-alt')
                        doc.expo_icon_name = 'file-text-o';
                    else
                        doc.expo_icon_name = doc.fa_icon_name + '-o';
                    return doc;
                });
                setDocuments(documents);
                await filterDocuments(search);
            } catch(e: any) {
                alert('Erreur : ' + e.message);
            } finally {
                setLoading(false);
            }
        }

        fetchDocuments();
    }, [filterDocuments, search]);

    for (let i = 0; i < documents.length; i++) {
        if (!docRefs.current[i]) {
            docRefs.current[i] = React.createRef();
        }
    }

    return (
        <>
            <Provider>
                {isLoading ? (
                    <ActivityIndicator  size="large" />
                ) : (
                    <>
                        <SearchBar placeholder="Rechercher..." onChangeText={(text) => setSearch(text)} value={search || ''}/>
                        <ScrollView style={{paddingTop: 20, paddingHorizontal: 20}}>
                            <View style={{display: "flex", flexDirection: 'row', rowGap: 10, flexWrap: "wrap"}}>
                                {filteredDocuments.map((doc: Document, i: number) => {
                                    return <View key={i} style={{width: "33%", padding: 5}}>
                                            <Pressable  ref={docRefs.current[i]}
                                                          onPress={(e) => openMenu(i, e)}>
                                                <FontAwesome name={doc.expo_icon_name || "file-pdf-o"} size={50} style={{textAlign: "center"}} />
                                                <Text style={{textAlign: "center", marginTop: 5}}>{doc.name}</Text>
                                        </Pressable>
                                    </View>
                                    ;
                                })}
                            </View>

                            {currentDoc &&
                                <Menu
                                    visible={visible}
                                    onDismiss={closeMenu}
                                    anchor={menuPosition}
                                    statusBarHeight={0}
                                >
                                    <Menu.Item onPress={() => copyLink(currentDoc.url)} title="Copier le lien"/>
                                    <Menu.Item onPress={() => openLink(currentDoc.url)} title="Ouvrir"/>
                                </Menu>
                            }
                        </ScrollView>
                    </>
                )}
            </Provider>
        </>
    );
}
