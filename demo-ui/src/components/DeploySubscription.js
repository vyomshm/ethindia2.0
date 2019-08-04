import React from 'react';
import { Button, Form, FormGroup, Label, Input, FormText, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle } from 'reactstrap';


class Subscription extends React.Component {
    render() {
        return (
            <Card style={{padding: '20px', margin:'auto', maxHeight:'50vh', maxWidth:'50vw'}}>
                <h1 ><b> Subscription </b></h1>
                <Form>
                    <FormGroup>
                        <Label for="Subscription">Name</Label>
                        <Input type="text" name="subscription" id="subscriptionName" placeholder="Name of your subscription" />
                    </FormGroup>
                    <FormGroup>
                        <Label for="Symbol">Symbol</Label>
                        <Input type="text" name="symbol" id="symbol" placeholder="Symbol of your token" />
                    </FormGroup>
                    <FormGroup>
                        <Label for="StackAmount">Stack Amount</Label>
                        <Input type="text" name="amount" id="stackAmount" placeholder="Minimum stack amount" />
                    </FormGroup>
                    <Button onClick={() => this.props.deployContract()}>Deploy Subscription Contract</Button>
                </Form>
            </Card>
        )
    }

}

export default Subscription;
