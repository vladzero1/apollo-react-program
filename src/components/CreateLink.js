import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useHistory } from 'react-router';
import { FEED_QUERY } from './Linklist';
import {LINKS_PER_PAGE} from '../constant';

const CREATE_LINK_MUTATION = gql`
    mutation PostMutation( 
        $description: String!
        $url: String!
    ){
        post(description: $description, url: $url){
            id,
            createdAt,
            url,
            description
        }
    }
`;


const CreateLink = () => {
    const history = useHistory();

    const [formstate, setFormstate] = useState({
        description: '',
        url: ''
    });

    const [createLink] = useMutation(CREATE_LINK_MUTATION, {
        variables: {
            description: formstate.description,
            url: formstate.url
        },
        update: (cache, { data: { post } }) => {

            const take = LINKS_PER_PAGE;
            const skip = 0;
            const orderBy = { createdAt: 'desc' }

            const data = cache.readQuery({
                query: FEED_QUERY,
                variables: {
                    take,
                    skip,
                    orderBy
                }
            });

            cache.writeQuery({
                query: FEED_QUERY,
                data: {
                    feed: {
                        links: [post, ...data.feed.links]
                    }
                },
                variables: {
                    take,
                    skip,
                    orderBy
                }
            });
            
        },
        onCompleted: () => history.push('/')
    });

    return (
        <div>
            <form onSubmit={(e) => {
                e.preventDefault();
                createLink();
            }}>
                <div className="flex flex-column mt3">
                    <input
                        className="mb2"
                        value={formstate.description}
                        onChange={(e) =>
                            setFormstate({
                                ...formstate,
                                description: e.target.value
                            })}
                        type="text"
                        placeholder="Description for the link"
                    />
                    <input
                        className="mb2"
                        value={formstate.url}
                        onChange={(e) =>
                            setFormstate({
                                ...formstate,
                                url: e.target.value
                            })}
                        type="text"
                        placeholder="The Url for the link"
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default CreateLink;