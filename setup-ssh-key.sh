#!/bin/bash

# Quick SSH Key Setup for EcoBottle EC2 Deployment
set -e

echo "🔑 Setting up SSH key for EcoBottle deployment"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

echo "Choose an option:"
echo "1. I have an existing .pem key file"
echo "2. Create a new AWS key pair"
echo "3. Use an existing key in ~/.ssh/"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        read -p "Enter the path to your .pem file: " pem_path
        if [ ! -f "$pem_path" ]; then
            print_error "File not found: $pem_path"
            exit 1
        fi
        
        key_name=$(basename "$pem_path")
        cp "$pem_path" ~/.ssh/
        chmod 400 ~/.ssh/"$key_name"
        
        print_status "Key copied to ~/.ssh/$key_name"
        print_status "Updated deploy-to-ec2.sh with key path"
        
        # Update the deploy script
        sed -i "s|KEY_FILE=\".*\"|KEY_FILE=\"\$HOME/.ssh/$key_name\"|" deploy-to-ec2.sh
        ;;
        
    2)
        echo ""
        read -p "Enter key pair name (default: ecobottle-key): " key_name
        key_name=${key_name:-ecobottle-key}
        
        print_status "Creating new AWS key pair: $key_name"
        
        if aws ec2 create-key-pair --key-name "$key_name" --query 'KeyMaterial' --output text > ~/.ssh/"$key_name".pem 2>/dev/null; then
            chmod 400 ~/.ssh/"$key_name".pem
            print_status "✅ Key pair created: ~/.ssh/$key_name.pem"
            
            # Update the deploy script
            sed -i "s|KEY_FILE=\".*\"|KEY_FILE=\"\$HOME/.ssh/$key_name.pem\"|" deploy-to-ec2.sh
            print_status "✅ Updated deploy-to-ec2.sh"
        else
            print_error "Failed to create key pair. Check AWS CLI configuration."
            exit 1
        fi
        ;;
        
    3)
        echo ""
        echo "Available keys in ~/.ssh/:"
        ls ~/.ssh/*.pem 2>/dev/null | xargs -n1 basename 2>/dev/null || echo "No .pem files found"
        echo ""
        read -p "Enter key filename (e.g., my-key.pem): " key_name
        
        if [ ! -f ~/.ssh/"$key_name" ]; then
            print_error "Key file not found: ~/.ssh/$key_name"
            exit 1
        fi
        
        chmod 400 ~/.ssh/"$key_name"
        
        # Update the deploy script
        sed -i "s|KEY_FILE=\".*\"|KEY_FILE=\"\$HOME/.ssh/$key_name\"|" deploy-to-ec2.sh
        print_status "✅ Updated deploy-to-ec2.sh to use ~/.ssh/$key_name"
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_status "🎉 SSH key setup completed!"
echo ""
echo "Next steps:"
echo "1. Make sure your EC2 security group allows SSH access from your IP"
echo "2. Verify the key works: ssh -i ~/.ssh/your-key.pem ubuntu@ec2-13-125-17-12.ap-northeast-2.compute.amazonaws.com"
echo "3. Run deployment: ./deploy-to-ec2.sh"
echo ""
print_warning "Security reminder:"
echo "- Keep your .pem file secure and never share it"
echo "- Consider using AWS Systems Manager Session Manager for better security"
